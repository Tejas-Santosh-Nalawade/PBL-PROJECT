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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type StudyResource } from "@/lib/types";
import { formatDistance } from 'date-fns';
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
  resourceType: z.enum(["Book", "Article", "Video", "Practice Set"]),
  url: z.string().url("Please enter a valid URL").optional(),
  content: z.string().optional(),
  tags: z.string().transform(val => val.split(",").map(tag => tag.trim())).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function StudyResources() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      resourceType: "Book",
      url: "",
      content: "",
      tags: "",
    },
  });

  // Fetch study resources
  const { data: resources, isLoading } = useQuery({
    queryKey: ["/api/study-resources", { userId: mockUser.id }],
    queryFn: async () => {
      const response = await fetch(`/api/study-resources?userId=${mockUser.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch study resources");
      }
      return response.json() as Promise<StudyResource[]>;
    },
  });

  // Add new resource mutation
  const addResourceMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const resourceData = {
        ...values,
        userId: mockUser.id,
      };
      
      const response = await apiRequest("POST", "/api/study-resources", resourceData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-resources"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Study resource added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add study resource: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Delete resource mutation
  const deleteResourceMutation = useMutation({
    mutationFn: async (resourceId: number) => {
      const response = await apiRequest("DELETE", `/api/study-resources/${resourceId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-resources"] });
      toast({
        title: "Success",
        description: "Resource deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete resource: " + error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    addResourceMutation.mutate(values);
  };

  const handleDeleteResource = (resourceId: number) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      deleteResourceMutation.mutate(resourceId);
    }
  };

  const getResourceTypeIcon = (type: string): string => {
    switch (type) {
      case 'Book':
        return 'auto_stories';
      case 'Article':
        return 'article';
      case 'Video':
        return 'play_arrow';
      case 'Practice Set':
        return 'history_edu';
      default:
        return 'description';
    }
  };

  const getResourceTypeColors = (type: string): {bg: string, text: string} => {
    switch (type) {
      case 'Book':
        return { bg: 'bg-primary/10', text: 'text-primary' };
      case 'Article':
        return { bg: 'bg-secondary/10', text: 'text-secondary' };
      case 'Video':
        return { bg: 'bg-red-100', text: 'text-red-600' };
      case 'Practice Set':
        return { bg: 'bg-accent/10', text: 'text-accent' };
      default:
        return { bg: 'bg-muted', text: 'text-muted-foreground' };
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Filter and search resources
  const filteredResources = resources?.filter(resource => {
    const matchesFilter = currentFilter === "All" || resource.resourceType === currentFilter;
    const matchesSearch = searchQuery === "" || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (resource.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) || false);
    
    return matchesFilter && matchesSearch;
  }) || [];

  // Get unique resource types for filter
  const resourceTypes = resources 
    ? ["All", ...new Set(resources.map(resource => resource.resourceType))]
    : ["All", "Book", "Article", "Video", "Practice Set"];

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
          title="Study Resources" 
          user={mockUser} 
        />
        
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold font-poppins mb-2">Study Resources</h1>
              <p className="text-muted-foreground">
                Manage your educational resources and study materials
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0 bg-primary text-white">
                  <span className="material-icons mr-2 text-sm">add</span>
                  Add New Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add Study Resource</DialogTitle>
                  <DialogDescription>
                    Add a new study resource to your collection. Fill in the details below.
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
                            <Input placeholder="E.g. Advanced Database Concepts" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="resourceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resource Type</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select resource type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Book">Book</SelectItem>
                              <SelectItem value="Article">Article</SelectItem>
                              <SelectItem value="Video">Video</SelectItem>
                              <SelectItem value="Practice Set">Practice Set</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Brief description of the resource..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g. https://example.com/resource" {...field} />
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
                          <FormLabel>Content (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="You can add notes or content excerpts here..." 
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
                            <Input placeholder="E.g. databases, SQL, learning" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="submit"
                        className="bg-primary text-white"
                        disabled={addResourceMutation.isPending}
                      >
                        {addResourceMutation.isPending ? "Adding..." : "Add Resource"}
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
                  placeholder="Search resources by title, description, or tags..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <Select value={currentFilter} onValueChange={setCurrentFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="h-20 bg-muted"></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredResources.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <span className="material-icons text-3xl text-muted-foreground">school</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">
                  {resources?.length === 0 
                    ? "No Study Resources Yet" 
                    : "No Matching Resources"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {resources?.length === 0 
                    ? "Add your first study resource to start building your library." 
                    : "Try adjusting your search or filter criteria."}
                </p>
                {resources?.length === 0 && (
                  <Button 
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-primary text-white"
                  >
                    <span className="material-icons mr-2 text-sm">add</span>
                    Add First Resource
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => {
                const typeColors = getResourceTypeColors(resource.resourceType);
                return (
                  <Card key={resource.id} className="hover:shadow-[0_4px_8px_rgba(0,0,0,0.12)] transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start mb-4">
                        <div className={cn("h-12 w-12 flex-shrink-0 rounded overflow-hidden mr-3 flex items-center justify-center", typeColors.bg, typeColors.text)}>
                          <span className="material-icons">
                            {getResourceTypeIcon(resource.resourceType)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium line-clamp-2">{resource.title}</h3>
                          <Badge variant="secondary" className={cn("mt-1", typeColors.bg, typeColors.text)}>
                            {resource.resourceType}
                          </Badge>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10 -mt-1 -mr-1"
                          onClick={() => handleDeleteResource(resource.id)}
                        >
                          <span className="material-icons">delete</span>
                        </Button>
                      </div>
                      {resource.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                          {resource.description}
                        </p>
                      )}
                      {resource.url && (
                        <div className="flex items-center text-sm text-primary mb-3 truncate">
                          <span className="material-icons text-sm mr-1">link</span>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline truncate"
                          >
                            {resource.url}
                          </a>
                        </div>
                      )}
                      {resource.tags && resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {resource.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
                        <span>
                          Added {formatDistance(new Date(resource.addedDate), new Date(), { addSuffix: true })}
                        </span>
                        {resource.rating && (
                          <div className="flex items-center">
                            <span className="material-icons text-accent text-sm">star</span>
                            <span className="ml-1">{resource.rating}/5</span>
                            {resource.reviews > 0 && (
                              <span className="ml-1">({resource.reviews})</span>
                            )}
                          </div>
                        )}
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
