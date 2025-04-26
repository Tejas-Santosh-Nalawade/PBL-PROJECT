import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type VideoResource } from "@/lib/types";
import { format, formatDistance } from 'date-fns';
import { cn } from "@/lib/utils";

// Mock user for development
const mockUser = {
  id: 1,
  name: "Alex Johnson",
  username: "alex.johnson",
  firstName: "Alex",
  image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
};

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  youtubeUrl: z.string().url("Please enter a valid YouTube URL"),
  tags: z.string().transform(val => val.split(",").map(tag => tag.trim())).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function VideoResources() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      youtubeUrl: "",
      tags: "",
    },
  });

  // Fetch video resources
  const { data: videos, isLoading } = useQuery({
    queryKey: ["/api/video-resources"],
    queryFn: async () => {
      const response = await fetch("/api/video-resources");
      if (!response.ok) {
        throw new Error("Failed to fetch video resources");
      }
      return response.json() as Promise<VideoResource[]>;
    },
  });

  // Add new video resource mutation
  const addVideoMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const videoData = {
        ...values,
        // Extract thumbnail from YouTube URL
        thumbnail: getYouTubeThumbnailUrl(values.youtubeUrl),
      };
      
      const response = await apiRequest("POST", "/api/video-resources", videoData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/video-resources"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Video resource added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add video resource: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Delete video resource mutation
  const deleteVideoMutation = useMutation({
    mutationFn: async (videoId: number) => {
      const response = await apiRequest("DELETE", `/api/video-resources/${videoId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/video-resources"] });
      toast({
        title: "Success",
        description: "Video resource deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete video resource: " + error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    addVideoMutation.mutate(values);
  };

  const handleDeleteVideo = (videoId: number) => {
    if (confirm("Are you sure you want to delete this video resource?")) {
      deleteVideoMutation.mutate(videoId);
    }
  };

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Get YouTube thumbnail URL from video URL
  const getYouTubeThumbnailUrl = (url: string): string => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
  };

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return "Unknown";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Filter videos by search query
  const filteredVideos = videos?.filter(video => {
    return (
      searchQuery === "" || 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (video.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) || false)
    );
  }) || [];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        isOpen={isSidebarOpen} 
        closeSidebar={() => setIsSidebarOpen(false)} 
        recentPapers={[]}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={toggleSidebar} 
          title="Video Resources" 
          user={mockUser} 
        />
        
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold font-poppins mb-2">Video Resources</h1>
              <p className="text-muted-foreground">
                Curated educational videos to enhance your learning
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0 bg-primary text-white">
                  <span className="material-icons mr-2 text-sm">add</span>
                  Add New Video
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add Video Resource</DialogTitle>
                  <DialogDescription>
                    Add a new educational video resource to the collection.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g. Introduction to Machine Learning" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="youtubeUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>YouTube URL</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g. https://www.youtube.com/watch?v=..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Brief description of the video content..." 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags (Optional, comma-separated)</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g. machine learning, ai, tutorial" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="submit"
                        className="bg-primary text-white"
                        disabled={addVideoMutation.isPending}
                      >
                        {addVideoMutation.isPending ? "Adding..." : "Add Video"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mb-6">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="material-icons text-muted-foreground text-sm">search</span>
              </span>
              <Input
                type="text"
                placeholder="Search video resources by title, description, or tags..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted"></div>
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredVideos.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <span className="material-icons text-3xl text-muted-foreground">video_library</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {videos?.length === 0 
                    ? "No Video Resources Yet" 
                    : "No Matching Videos"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {videos?.length === 0 
                    ? "Add your first video resource to start building your collection." 
                    : "Try adjusting your search criteria."}
                </p>
                {videos?.length === 0 && (
                  <Button 
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-primary text-white"
                  >
                    <span className="material-icons mr-2 text-sm">add</span>
                    Add First Video
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => {
                const videoId = getYouTubeVideoId(video.youtubeUrl);
                
                return (
                  <Card key={video.id} className="overflow-hidden hover:shadow-[0_4px_8px_rgba(0,0,0,0.12)] transition-shadow">
                    <div className="relative aspect-video group">
                      <img 
                        src={video.thumbnail || getYouTubeThumbnailUrl(video.youtubeUrl)} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a 
                          href={video.youtubeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white"
                        >
                          <span className="material-icons">play_arrow</span>
                        </a>
                      </div>
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {formatDuration(video.duration)}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium line-clamp-1">{video.title}</h3>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10 -mt-1 -mr-1"
                          onClick={() => handleDeleteVideo(video.id)}
                        >
                          <span className="material-icons">delete</span>
                        </Button>
                      </div>
                      {video.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {video.description}
                        </p>
                      )}
                      {video.tags && video.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {video.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex justify-between items-center text-xs text-muted-foreground mt-3 pt-3 border-t">
                        <span>
                          Added {formatDistance(new Date(video.addedDate), new Date(), { addSuffix: true })}
                        </span>
                        <span className="flex items-center">
                          <span className="material-icons text-sm mr-1">visibility</span>
                          {video.views} views
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
