import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIChatPreviewProps {
  initialMessages?: Message[];
  userId: number;
}

export function AIChatPreview({ initialMessages = [], userId }: AIChatPreviewProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async (message: string, isQuickPrompt = false) => {
    try {
      if (!message.trim() && !isQuickPrompt) return;
      
      const newMessage = { role: "user" as const, content: message };
      setMessages(prev => [...prev, newMessage]);
      setInputMessage("");
      setIsLoading(true);

      const response = await apiRequest("POST", "/api/ai/chat", {
        userId,
        prompt: message,
        history: messages
      });
      
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response from the AI assistant.",
        variant: "destructive"
      });
      console.error("AI chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { text: "Explain concept", prompt: "Can you explain a concept in simple terms?" },
    { text: "Practice problems", prompt: "Generate some practice problems for me to solve." },
    { text: "Study plan", prompt: "Help me create a study plan for my upcoming exam." }
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="px-6 py-4 flex flex-row items-center justify-between border-b">
        <CardTitle className="text-base font-semibold">AI Study Assistant</CardTitle>
        <Link href="/ai-assistant">
          <Button variant="link" size="sm" className="text-primary">
            Full Chat
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-y-auto space-y-4" style={{ maxHeight: "320px" }}>
        {messages.length === 0 ? (
          <div className="flex items-start">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 shrink-0">
              <span className="material-icons text-primary text-sm">smart_toy</span>
            </div>
            <div className="bg-card rounded-lg rounded-tl-none p-3 max-w-[85%] shadow-sm">
              <p className="text-sm">Hello! I'm your AI study assistant. How can I help you with your exam preparation today?</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start ${
                msg.role === "user" ? "justify-end" : ""
              }`}
            >
              {msg.role === "assistant" && (
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 shrink-0">
                  <span className="material-icons text-primary text-sm">smart_toy</span>
                </div>
              )}
              <div
                className={`${
                  msg.role === "user"
                    ? "bg-primary/10 text-foreground rounded-lg rounded-tr-none"
                    : "bg-card rounded-lg rounded-tl-none shadow-sm"
                } p-3 max-w-[85%]`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === "user" && (
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
            <div className="bg-card rounded-lg rounded-tl-none p-3 max-w-[85%] shadow-sm">
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}
      </CardContent>
      <div className="p-4 border-t">
        <form 
          className="relative" 
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputMessage);
          }}
        >
          <Input
            type="text"
            placeholder="Ask anything about your studies..."
            className="w-full rounded-full pr-10"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary hover:bg-primary/5 p-1 rounded-full"
            disabled={isLoading}
          >
            <span className="material-icons">send</span>
          </Button>
        </form>
        <div className="flex justify-center mt-2">
          {quickPrompts.map((prompt, index) => (
            <Button
              key={index}
              variant="secondary"
              size="sm"
              className="mx-1 text-xs bg-muted hover:bg-muted/80 text-muted-foreground"
              onClick={() => sendMessage(prompt.prompt, true)}
              disabled={isLoading}
            >
              {prompt.text}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default AIChatPreview;
