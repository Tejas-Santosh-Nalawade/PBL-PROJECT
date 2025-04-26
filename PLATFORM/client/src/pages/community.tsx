import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type CommunityPost } from "@/lib/types";
import { formatDistance } from "date-fns";

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
  content: z.string().min(10, "Post content is required and must be at least 10 characters"),
  tags: z.string().transform(val => val.split(",").map(tag => tag.trim())).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Community() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: "",
    },
  });

  // Fetch community posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/community-posts"],
    queryFn: async () => {
      const response = await fetch("/api/community-posts");
      if (!response.ok) {
        throw new Error("Failed to fetch community posts");
      }
      return response.json() as Promise<CommunityPost[]>;
    },
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const postData = {
        ...values,
        userId: mockUser.id,
      };
      
      const response = await apiRequest("POST", "/api/community-posts", postData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community-posts"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Your post has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create post: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Like post mutation
  const likePostMutation = useMutation({
    mutationFn: async (postId: number) => {
      const response = await apiRequest("PATCH", `/api/community-posts/${postId}`, {
        likes: (posts?.find(p => p.id === postId)?.likes || 0) + 1
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community-posts"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to like post: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle solved status mutation
  const toggleSolvedMutation = useMutation({
    mutationFn: async (post: CommunityPost) => {
      const response = await apiRequest("PATCH", `/api/community-posts/${post.id}`, {
        solved: !post.solved
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community-posts"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update post status: " + error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    createPostMutation.mutate(values);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Filter and sort posts
  const filteredPosts = posts?.filter(post => {
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) || false);
    
    return matchesSearch;
  }) || [];

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (currentTab === "popular") {
      return b.likes - a.likes;
    } else if (currentTab === "solved") {
      return (b.solved ? 1 : 0) - (a.solved ? 1 : 0);
    } else {
      return new Date(b.postDate).getTime() - new Date(a.postDate).getTime();
    }
  });

  // Get author display information
  const getAuthorInfo = (post: CommunityPost) => {
    // In a real app, you would fetch user details based on the userId
    // Here we're using mock data for demonstration
    if (post.userId === mockUser.id) {
      return {
        name: mockUser.name,
        avatar: mockUser.image
      };
    } else if (post.author) {
      return post.author;
    } else {
      return {
        name: "User " + post.userId,
        avatar: undefined
      };
    }
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
          title="Community" 
          user={mockUser} 
        />
        
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold font-poppins mb-2">Community Forum</h1>
              <p className="text-muted-foreground">
                Connect with fellow students, ask questions, and share resources
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0 bg-primary text-white">
                  <span className="material-icons mr-2 text-sm">add</span>
                  New Discussion
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Start a New Discussion</DialogTitle>
                  <DialogDescription>
                    Share your question or insight with the community.
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
                            <Input placeholder="E.g. Help with dynamic programming problem" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your question or share your thoughts..." 
                              className="min-h-[200px]" 
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
                            <Input placeholder="E.g. algorithms, help, discussion" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="submit"
                        className="bg-primary text-white"
                        disabled={createPostMutation.isPending}
                      >
                        {createPostMutation.isPending ? "Posting..." : "Post Discussion"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mb-6">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="material-icons text-muted-foreground text-sm">search</span>
                </span>
                <Input
                  type="text"
                  placeholder="Search discussions..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Tabs 
                defaultValue="recent" 
                value={currentTab} 
                onValueChange={setCurrentTab}
                className="w-full md:w-auto"
              >
                <TabsList className="grid grid-cols-3 w-full md:w-[360px]">
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                  <TabsTrigger value="solved">Solved</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="p-4 flex-row gap-4">
                    <div className="h-10 w-10 bg-muted rounded-full"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-5/6"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <span className="material-icons text-3xl text-muted-foreground">forum</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {posts?.length === 0 
                    ? "No Discussions Yet" 
                    : "No Matching Discussions"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {posts?.length === 0 
                    ? "Start the first discussion to engage with the community." 
                    : "Try adjusting your search criteria."}
                </p>
                {posts?.length === 0 && (
                  <Button 
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-primary text-white"
                  >
                    <span className="material-icons mr-2 text-sm">add</span>
                    Start First Discussion
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedPosts.map((post) => {
                const author = getAuthorInfo(post);
                const isAuthor = post.userId === mockUser.id;
                
                return (
                  <Card key={post.id} className="hover:shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src={author.avatar} alt={author.name} />
                          <AvatarFallback>{author.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{post.title}</h4>
                            <div className="flex items-center">
                              {post.solved && (
                                <Badge className="mr-2 bg-green-100 text-green-800 text-xs">
                                  Solved
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {post.postDate ? formatDistance(new Date(post.postDate), new Date(), { addSuffix: true }) : 'Recently'}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {post.content.length > 200 
                              ? post.content.substring(0, 200) + "..." 
                              : post.content}
                          </p>
                          
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {post.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex space-x-4">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-muted-foreground hover:text-primary text-sm flex items-center h-8 px-2"
                                onClick={() => likePostMutation.mutate(post.id)}
                              >
                                <span className="material-icons text-sm mr-1">thumb_up</span>
                                {post.likes}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-muted-foreground hover:text-primary text-sm flex items-center h-8 px-2"
                              >
                                <span className="material-icons text-sm mr-1">comment</span>
                                {post.comments}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-muted-foreground hover:text-primary text-sm flex items-center h-8 px-2"
                              >
                                <span className="material-icons text-sm mr-1">share</span>
                                Share
                              </Button>
                            </div>
                            <div>
                              {isAuthor && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className={post.solved ? "border-green-500 text-green-500" : "border-primary text-primary"}
                                  onClick={() => toggleSolvedMutation.mutate(post)}
                                >
                                  <span className="material-icons text-sm mr-1">
                                    {post.solved ? "check_circle" : "radio_button_unchecked"}
                                  </span>
                                  {post.solved ? "Solved" : "Mark as Solved"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
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
