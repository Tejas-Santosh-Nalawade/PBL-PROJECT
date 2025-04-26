import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

// Sample suggested prompts
const suggestedPrompts = [
  {
    title: "Explain a Concept",
    prompts: [
      "Explain the concept of polymorphism in object-oriented programming",
      "What is the difference between TCP and UDP?",
      "Explain how RSA encryption works"
    ]
  },
  {
    title: "Generate Study Resources",
    prompts: [
      "Create a study guide for neural networks",
      "Generate a list of key formulas for calculus",
      "Make 5 practice problems on binary search trees"
    ]
  },
  {
    title: "Exam Preparation",
    prompts: [
      "Help me create a study plan for my database exam in 2 weeks",
      "What are common mistakes to avoid in algorithm exams?",
      "How can I effectively memorize key definitions for my networking exam?"
    ]
  },
  {
    title: "Resource Recommendations",
    prompts: [
      "Recommend good textbooks for learning data structures",
      "What are some helpful YouTube channels for learning machine learning?",
      "Can you suggest online resources for practicing SQL queries?"
    ]
  }
];

export default function AiAssistant() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Get current user from auth context
  const { user } = useAuth();
  
  // Fetch chat history
  const { data: chatHistory, isLoading: historyLoading } = useQuery({
    queryKey: [`/api/ai/chat/${user?.id}`],
    queryFn: async () => {
      if (!user) return [];
      try {
        const response = await fetch(`/api/ai/chat/${user.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch chat history");
        }
        const data = await response.json();
        return data.history as ChatMessage[];
      } catch (error) {
        console.error("Error fetching chat history:", error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Set initial messages when chat history is loaded
  useEffect(() => {
    if (chatHistory && chatHistory.length > 0) {
      setMessages(chatHistory);
    } else {
      // Set an empty state - we'll show a welcome message in the UI
      setMessages([]);
    }
  }, [chatHistory]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!user) throw new Error("You must be logged in to use the AI assistant");
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/ai/chat", {
        userId: user.id,
        prompt: message,
        history: messages
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(data.history);
      queryClient.invalidateQueries({ queryKey: [`/api/ai/chat/${user?.id}`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message: " + error.message,
        variant: "destructive",
      });
      // Add a error message from the AI to indicate the failure
      setMessages(prev => [
        ...prev,
        { 
          role: "assistant", 
          content: "I'm sorry, I encountered an error processing your request. Please try again or contact support if the issue persists."
        }
      ]);
    },
    onSettled: () => {
      setIsLoading(false);
      setInputMessage("");
    },
  });

  const handleSendMessage = (message: string = inputMessage) => {
    if (!message.trim()) return;
    
    // Add user message to the chat immediately
    const newUserMessage: ChatMessage = { role: "user", content: message };
    setMessages(prev => [...prev, newUserMessage]);
    
    // Send message to the API
    sendMessageMutation.mutate(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
          title="AI Study Assistant" 
          user={user ? {
            name: user.firstName || user.username,
            username: user.username,
            image: user.profileImage || undefined
          } : undefined} 
        />
        
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <div className="flex flex-col h-full max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold font-poppins mb-2">AI Study Assistant</h1>
              <p className="text-muted-foreground">
                Get help with your studies using our AI-powered assistant, powered by Google Gemini
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full">
              {/* Suggested Prompts (Sidebar) */}
              <div className="hidden md:block md:col-span-1 space-y-4">
                <h2 className="text-sm font-semibold">Suggested Prompts</h2>
                
                {suggestedPrompts.map((category, idx) => (
                  <Card key={idx}>
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-sm font-medium">{category.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-4 space-y-2">
                      {category.prompts.map((prompt, promptIdx) => (
                        <Button
                          key={promptIdx}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs text-left p-2 h-auto font-normal"
                          onClick={() => {
                            setInputMessage(prompt);
                            handleSendMessage(prompt);
                          }}
                          disabled={isLoading}
                        >
                          {prompt}
                        </Button>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Chat Area */}
              <div className="md:col-span-3 flex flex-col h-[calc(100vh-220px)]">
                <Card className="flex-1 overflow-hidden flex flex-col">
                  <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {historyLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      messages.map((message, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex items-start",
                            message.role === "user" ? "justify-end" : ""
                          )}
                        >
                          {message.role === "assistant" && (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 shrink-0">
                              <span className="material-icons text-primary text-sm">smart_toy</span>
                            </div>
                          )}
                          <div
                            className={cn(
                              "p-3 max-w-[85%] whitespace-pre-wrap",
                              message.role === "user"
                                ? "bg-primary/10 text-foreground rounded-lg rounded-tr-none"
                                : "bg-card rounded-lg rounded-tl-none shadow-[0_2px_4px_rgba(0,0,0,0.1)]"
                            )}
                          >
                            <p className="text-sm">{message.content}</p>
                          </div>
                          {message.role === "user" && (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center ml-3 shrink-0">
                              <span className="material-icons text-muted-foreground text-sm">person</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex items-start">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 shrink-0">
                          <span className="material-icons text-primary text-sm">smart_toy</span>
                        </div>
                        <div className="bg-card rounded-lg rounded-tl-none p-3 shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
                          <div className="flex space-x-2">
                            <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </CardContent>
                  
                  <div className="p-4 border-t">
                    <form 
                      className="flex items-center space-x-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                      }}
                    >
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="flex-1"
                        disabled={isLoading}
                        onKeyDown={handleKeyDown}
                      />
                      <Button 
                        type="submit"
                        size="icon"
                        className="bg-primary text-primary-foreground"
                        disabled={isLoading || !inputMessage.trim()}
                      >
                        <span className="material-icons">send</span>
                      </Button>
                    </form>
                    
                    {/* Mobile Suggested Prompts */}
                    <div className="flex md:hidden items-center gap-2 mt-3 overflow-x-auto pb-2">
                      <Badge variant="outline" className="whitespace-nowrap">Try:</Badge>
                      {suggestedPrompts.flatMap((category, catIdx) => 
                        category.prompts.slice(0, 1).map((prompt, promptIdx) => (
                          <Button
                            key={`mobile-${catIdx}-${promptIdx}`}
                            variant="secondary"
                            size="sm"
                            className="bg-muted hover:bg-muted/80 text-xs whitespace-nowrap"
                            onClick={() => {
                              setInputMessage(prompt);
                              handleSendMessage(prompt);
                            }}
                            disabled={isLoading}
                          >
                            {prompt.length > 30 ? prompt.substring(0, 30) + "..." : prompt}
                          </Button>
                        ))
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
