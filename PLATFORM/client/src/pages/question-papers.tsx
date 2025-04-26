import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type QuestionPaper } from "@/lib/types";
import { format, formatDistance } from 'date-fns';

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
  subject: z.string().min(2, "Subject is required"),
  difficulty: z.enum(["Low", "Medium", "High"]),
  description: z.string().optional(),
  paperContent: z.string().min(10, "Question paper content is required"),
  tags: z.string().transform(val => val.split(",").map(tag => tag.trim())).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function QuestionPapers() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState<QuestionPaper | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      subject: "",
      difficulty: "Medium",
      description: "",
      paperContent: "",
      tags: "",
    },
  });

  // Fetch question papers
  const { data: papers, isLoading } = useQuery({
    queryKey: ["/api/question-papers", { userId: mockUser.id }],
    queryFn: async () => {
      const response = await fetch(`/api/question-papers?userId=${mockUser.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch question papers");
      }
      return response.json() as Promise<QuestionPaper[]>;
    },
  });

  // Upload question paper mutation
  const uploadMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const paperData = {
        ...values,
        userId: mockUser.id,
        numQuestions: estimateQuestionCount(values.paperContent),
        estimatedTime: estimateTimeRequired(values.difficulty, values.paperContent),
      };
      
      const response = await apiRequest("POST", "/api/question-papers", paperData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/question-papers"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Question paper uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload question paper: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Analyze question paper mutation
  const analyzeMutation = useMutation({
    mutationFn: async (paperId: number) => {
      setIsAnalyzing(true);
      const response = await apiRequest("POST", `/api/question-papers/${paperId}/analyze`, {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/question-papers"] });
      setSelectedPaper(data);
      toast({
        title: "Analysis Complete",
        description: "The question paper has been analyzed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze question paper: " + error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsAnalyzing(false);
    },
  });

  // Delete question paper mutation
  const deleteMutation = useMutation({
    mutationFn: async (paperId: number) => {
      const response = await apiRequest("DELETE", `/api/question-papers/${paperId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/question-papers"] });
      setSelectedPaper(null);
      toast({
        title: "Success",
        description: "Question paper deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete question paper: " + error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    uploadMutation.mutate(values);
  };

  const handleAnalyzePaper = (paperId: number) => {
    analyzeMutation.mutate(paperId);
  };

  const handleDeletePaper = (paperId: number) => {
    if (confirm("Are you sure you want to delete this question paper?")) {
      deleteMutation.mutate(paperId);
    }
  };

  // Helper function to estimate the number of questions
  const estimateQuestionCount = (content: string): number => {
    // Simple estimation based on line count and question markers
    const lines = content.split('\n');
    const questionMarkers = content.match(/Q\d+|Question \d+|Problem \d+/gi);
    return questionMarkers ? questionMarkers.length : Math.ceil(lines.length / 5);
  };

  // Helper function to estimate time required based on difficulty and content length
  const estimateTimeRequired = (difficulty: string, content: string): number => {
    const baseTime = {
      Low: 60,
      Medium: 90,
      High: 120
    }[difficulty] || 90;
    
    // Adjust based on content length
    const contentFactor = Math.ceil(content.length / 500);
    return baseTime + (contentFactor * 15);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        isOpen={isSidebarOpen} 
        closeSidebar={() => setIsSidebarOpen(false)}
        recentPapers={papers?.map(p => ({ id: p.id, title: p.title })) || []}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={toggleSidebar} 
          title="Question Papers" 
          user={mockUser} 
        />
        
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold font-poppins mb-2">Question Papers</h1>
              <p className="text-muted-foreground">
                Upload and analyze exam question papers to identify patterns and get insights
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="mt-4 md:mt-0 bg-primary text-white">
                  <span className="material-icons mr-2 text-sm">add</span>
                  Upload New Paper
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Upload Question Paper</DialogTitle>
                  <DialogDescription>
                    Upload a new question paper for analysis. Fill in the details and paste the paper content below.
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
                            <Input placeholder="E.g. Computer Science Midterm 2023" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-col sm:flex-row gap-4">
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="E.g. Computer Science" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="difficulty"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Difficulty</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Brief description of the paper..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="paperContent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Paper Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Paste the full question paper content here..." 
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
                            <Input placeholder="E.g. algorithms, data structures, midterm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button
                        type="submit"
                        className="bg-primary text-white"
                        disabled={uploadMutation.isPending}
                      >
                        {uploadMutation.isPending ? "Uploading..." : "Upload Paper"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="h-24 bg-muted"></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : papers?.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <span className="material-icons text-3xl text-muted-foreground">description</span>
                </div>
                <h3 className="font-semibold text-lg mb-2">No Question Papers Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your first question paper to get AI-powered analysis and insights.
                </p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-primary text-white"
                >
                  <span className="material-icons mr-2 text-sm">add</span>
                  Upload First Paper
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader className="border-b px-6 py-4">
                    <CardTitle className="text-base font-semibold">My Question Papers</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ul className="divide-y">
                      {papers?.map((paper) => (
                        <li 
                          key={paper.id} 
                          className={`p-4 cursor-pointer hover:bg-muted/20 transition-colors ${selectedPaper?.id === paper.id ? 'bg-primary/5 border-r-4 border-primary' : ''}`}
                          onClick={() => setSelectedPaper(paper)}
                        >
                          <div className="flex items-start">
                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center mr-3 shrink-0">
                              <span className="material-icons text-primary">description</span>
                            </div>
                            <div>
                              <h4 className="font-medium">{paper.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {paper.subject} • {paper.difficulty} difficulty
                              </p>
                              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                <span className="material-icons text-xs mr-1">calendar_today</span>
                                Uploaded {format(new Date(paper.uploadDate), 'MMM d, yyyy')}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-2">
                {selectedPaper ? (
                  <Card>
                    <CardHeader className="border-b px-6 py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-semibold">{selectedPaper.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedPaper.subject} • {selectedPaper.difficulty} difficulty • {selectedPaper.numQuestions || '?'} questions
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          {!selectedPaper.analyzed ? (
                            <Button 
                              variant="outline" 
                              className="text-primary border-primary"
                              onClick={() => handleAnalyzePaper(selectedPaper.id)}
                              disabled={isAnalyzing}
                            >
                              {isAnalyzing ? (
                                <>
                                  <span className="material-icons animate-spin mr-2 text-sm">refresh</span>
                                  Analyzing...
                                </>
                              ) : (
                                <>
                                  <span className="material-icons mr-2 text-sm">analytics</span>
                                  Analyze
                                </>
                              )}
                            </Button>
                          ) : (
                            <Badge className="bg-secondary text-white">
                              <span className="material-icons text-xs mr-1">check_circle</span>
                              Analyzed
                            </Badge>
                          )}
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeletePaper(selectedPaper.id)}
                          >
                            <span className="material-icons">delete</span>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Tabs defaultValue={selectedPaper.analyzed ? "analysis" : "content"}>
                        <TabsList className="mb-4">
                          <TabsTrigger value="content">Paper Content</TabsTrigger>
                          <TabsTrigger value="analysis" disabled={!selectedPaper.analyzed}>
                            Analysis
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="content">
                          <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm font-mono min-h-[300px] max-h-[600px] overflow-y-auto">
                            {selectedPaper.paperContent}
                          </div>
                          <div className="mt-4">
                            <h3 className="text-sm font-semibold mb-2">Tags:</h3>
                            <div className="flex flex-wrap gap-2">
                              {selectedPaper.tags?.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="bg-muted">
                                  {tag}
                                </Badge>
                              )) || (
                                <span className="text-sm text-muted-foreground">No tags specified</span>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="analysis">
                          {selectedPaper.analyzed && selectedPaper.analysisResults ? (
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-sm font-semibold mb-2">Topics Covered:</h3>
                                <div className="flex flex-wrap gap-2">
                                  {selectedPaper.analysisResults.topics.map((topic, index) => (
                                    <Badge key={index} variant="secondary" className="bg-primary/10 text-primary">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-3 bg-muted rounded-md">
                                  <p className="text-xs text-muted-foreground mb-1">Difficulty Assessment</p>
                                  <p className="font-medium flex items-center">
                                    <span className={`material-icons mr-1 ${
                                      selectedPaper.analysisResults.difficulty === 'High' ? 'text-destructive' :
                                      selectedPaper.analysisResults.difficulty === 'Medium' ? 'text-accent' :
                                      'text-secondary'
                                    }`}>
                                      {selectedPaper.analysisResults.difficulty === 'High' ? 'trending_up' :
                                       selectedPaper.analysisResults.difficulty === 'Medium' ? 'trending_flat' :
                                       'trending_down'}
                                    </span>
                                    {selectedPaper.analysisResults.difficulty}
                                  </p>
                                </div>
                                <div className="p-3 bg-muted rounded-md">
                                  <p className="text-xs text-muted-foreground mb-1">Time Estimate</p>
                                  <p className="font-medium">
                                    {Math.floor(selectedPaper.analysisResults.timeEstimate / 60)} hours {selectedPaper.analysisResults.timeEstimate % 60} mins
                                  </p>
                                </div>
                                <div className="p-3 bg-muted rounded-md">
                                  <p className="text-xs text-muted-foreground mb-1">Question Types</p>
                                  <p className="font-medium">{Object.keys(selectedPaper.analysisResults.questionTypeDistribution).length} types</p>
                                </div>
                              </div>
                              
                              <div>
                                <h3 className="text-sm font-semibold mb-2">Key Concepts to Review:</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  {selectedPaper.analysisResults.keyConceptsToReview.map((concept, index) => (
                                    <li key={index}>{concept}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h3 className="text-sm font-semibold mb-2">Question Type Distribution:</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  {Object.entries(selectedPaper.analysisResults.questionTypeDistribution).map(([type, percentage], index) => (
                                    <div key={index} className="p-2 bg-muted rounded-md">
                                      <p className="text-xs text-muted-foreground">{type}</p>
                                      <div className="flex items-center mt-1">
                                        <div className="w-full h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden">
                                          <div 
                                            className="bg-primary h-full" 
                                            style={{ width: `${percentage}%` }}
                                          ></div>
                                        </div>
                                        <span className="ml-2 text-xs">{percentage}%</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h3 className="text-sm font-semibold mb-2">Recommended Strategies:</h3>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                  {selectedPaper.analysisResults.recommendedStrategies.map((strategy, index) => (
                                    <li key={index}>{strategy}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h3 className="text-sm font-semibold mb-2">Similar Topics from Past Years:</h3>
                                <div className="flex flex-wrap gap-2">
                                  {selectedPaper.analysisResults.similarTopicsFromPastYears.length > 0 ? 
                                    selectedPaper.analysisResults.similarTopicsFromPastYears.map((topic, index) => (
                                      <Badge key={index} variant="outline">
                                        {topic}
                                      </Badge>
                                    )) : (
                                      <span className="text-sm text-muted-foreground">No similar topics identified</span>
                                    )
                                  }
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <span className="material-icons text-3xl text-muted-foreground">analytics</span>
                              </div>
                              <h3 className="font-semibold text-lg mb-2">No Analysis Available</h3>
                              <p className="text-muted-foreground mb-4">
                                Run the analysis to get AI-powered insights about this question paper.
                              </p>
                              <Button
                                variant="outline"
                                className="text-primary border-primary"
                                onClick={() => handleAnalyzePaper(selectedPaper.id)}
                                disabled={isAnalyzing}
                              >
                                {isAnalyzing ? (
                                  <>
                                    <span className="material-icons animate-spin mr-2 text-sm">refresh</span>
                                    Analyzing...
                                  </>
                                ) : (
                                  <>
                                    <span className="material-icons mr-2 text-sm">analytics</span>
                                    Analyze Now
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center py-12">
                      <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <span className="material-icons text-3xl text-muted-foreground">description</span>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">No Paper Selected</h3>
                      <p className="text-muted-foreground mb-4">
                        Select a question paper from the list to view its details and analysis.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
