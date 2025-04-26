import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";
import StatCard from "@/components/dashboard/stat-card";
import PaperInsights from "@/components/dashboard/paper-insights";
import ExamSchedule from "@/components/dashboard/exam-schedule";
import StudyResources from "@/components/dashboard/study-resources";
import AIChatPreview from "@/components/dashboard/ai-chat-preview";
import CommunityActivity from "@/components/dashboard/community-activity";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, addDays, differenceInDays } from "date-fns";

// Fallback user in case authentication isn't working
const fallbackUser = {
  id: 1,
  name: "Alex Johnson",
  username: "alex.johnson",
  firstName: "Alex",
  image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
};

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  
  // Use authenticated user if available, otherwise use fallback
  const activeUser = authUser || fallbackUser;

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics/1"],
    queryFn: async () => {
      // In a production environment, this would be fetched from the API
      // For now, we'll return mock data
      return {
        papersAnalyzed: 12,
        studyHours: 24.5,
        resourcesUsed: 18,
        aiInteractions: 42
      };
    }
  });

  // Fetch recent papers
  const { data: recentPapers, isLoading: papersLoading } = useQuery({
    queryKey: ["/api/question-papers", { userId: 1 }],
    queryFn: async () => {
      // Mock data for recent papers
      return [
        {
          id: 1,
          title: "Advanced Algorithms Final 2023",
          uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          tags: [
            { name: "Dynamic Programming" },
            { name: "Graph Theory" },
            { name: "NP-Completeness" }
          ],
          metrics: [
            { label: "Difficulty", value: "High" },
            { label: "Questions", value: "8" },
            { label: "Time Est.", value: "3 hours" },
            { label: "Resources", value: "12 related" }
          ]
        },
        {
          id: 2,
          title: "Database Systems Midterm",
          uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          tags: [
            { name: "SQL" },
            { name: "Normalization" },
            { name: "Indexing" }
          ],
          metrics: [
            { label: "Difficulty", value: "Medium" },
            { label: "Questions", value: "12" },
            { label: "Time Est.", value: "1.5 hours" },
            { label: "Resources", value: "8 related" }
          ]
        }
      ];
    }
  });

  // Fetch upcoming exams
  const { data: upcomingExams, isLoading: examsLoading } = useQuery({
    queryKey: ["/api/exam-schedule", { userId: 1 }],
    queryFn: async () => {
      // Mock data for upcoming exams
      const today = new Date();
      
      return [
        {
          id: 1,
          name: "Computer Networks",
          type: "Final Exam",
          date: format(addDays(today, 2), "MMM d, yyyy"),
          time: "9:00 AM",
          daysLeft: 2,
          readiness: 75
        },
        {
          id: 2,
          name: "Data Structures",
          type: "Midterm Exam",
          date: format(addDays(today, 7), "MMM d, yyyy"),
          time: "2:00 PM",
          daysLeft: 7,
          readiness: 50
        },
        {
          id: 3,
          name: "Software Engineering",
          type: "Project Presentation",
          date: format(addDays(today, 21), "MMM d, yyyy"),
          time: "11:00 AM",
          daysLeft: 21,
          readiness: 25
        }
      ];
    }
  });

  // Fetch recommended resources
  const { data: recommendedResources, isLoading: resourcesLoading } = useQuery({
    queryKey: ["/api/study-resources", { tags: ["algorithms", "databases", "networks"] }],
    queryFn: async () => {
      // Mock data for recommended resources
      return [
        {
          id: 1,
          title: "Fundamentals of Computer Networks",
          description: "A comprehensive guide to computer networks, covering TCP/IP, routing, and network security.",
          type: "Book",
          rating: 4,
          reviews: 128,
          addedDays: 14,
          bookmarked: false
        },
        {
          id: 2,
          title: "Advanced SQL Techniques",
          description: "Master complex SQL queries, performance optimization, and database design principles.",
          type: "Video Course",
          rating: 4.5,
          reviews: 94,
          addedDays: 5,
          bookmarked: false
        },
        {
          id: 3,
          title: "Dynamic Programming: A Complete Guide",
          description: "Comprehensive tutorial on solving DP problems with multiple examples and practice questions.",
          type: "Article",
          rating: 5,
          reviews: 216,
          addedDays: 1,
          bookmarked: true
        },
        {
          id: 4,
          title: "Graph Theory Problem Set",
          description: "Collection of 50+ graph theory problems with solutions and explanations for exam preparation.",
          type: "Practice Set",
          rating: 3.5,
          reviews: 78,
          addedDays: 7,
          bookmarked: false
        }
      ];
    }
  });

  // Fetch community posts
  const { data: communityPosts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/community-posts"],
    queryFn: async () => {
      // Mock data for community posts
      return [
        {
          id: 1,
          title: "Dynamic Programming Study Group",
          content: "I created a repository with solutions to the top 50 DP problems. Feel free to contribute or ask questions!",
          author: {
            id: 2,
            name: "John Smith",
            avatar: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          },
          timeAgo: "2 hours ago",
          likes: 24,
          comments: 8,
          hasRepository: true
        },
        {
          id: 2,
          title: "Networking Fundamentals Question",
          content: "Can someone explain the difference between TCP and UDP protocols? The textbook explanation is confusing me.",
          author: {
            id: 3,
            name: "Emma Wilson",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
          },
          timeAgo: "Yesterday",
          likes: 12,
          comments: 16,
          solved: true
        }
      ];
    }
  });

  // Format recent papers data
  const formattedPapers = recentPapers?.map(paper => ({
    ...paper,
    daysAgo: paper.uploadDate 
      ? differenceInDays(new Date(), new Date(paper.uploadDate))
      : 0
  })) || [];

  // Initial AI messages
  const initialAIMessages = [
    { role: "assistant" as const, content: "Hello! I'm your AI study assistant. How can I help you with your exam preparation today?" }
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        isOpen={isSidebarOpen} 
        closeSidebar={() => setIsSidebarOpen(false)} 
        recentPapers={formattedPapers.map(p => ({ id: p.id, title: p.title }))}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={toggleSidebar} 
          title="Dashboard" 
          user={{
            name: activeUser.firstName || activeUser.username,
            username: activeUser.username,
            image: authUser ? authUser.profileImage || undefined : fallbackUser.image
          }} 
        />
        
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          {/* Welcome Section */}
          <section className="mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold font-poppins mb-2">
                      Welcome back, {activeUser.firstName || activeUser.username}!
                    </h1>
                    <p className="text-muted-foreground">
                      You have <span className="font-medium text-primary">{upcomingExams?.length || 0}</span> upcoming exams and <span className="font-medium text-primary">{recommendedResources?.length || 0}</span> study resources waiting for review.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Button className="bg-primary text-white shadow-sm hover:bg-primary/90 font-medium">
                      <span className="material-icons mr-1 text-sm">add</span>
                      Upload New Paper
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
          
          {/* Analytics Summary */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold font-poppins mb-4">Study Analytics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Papers Analyzed"
                value={analytics?.papersAnalyzed || 0}
                icon="description"
                trend={{
                  direction: "up",
                  value: "3 new this week"
                }}
              />
              
              <StatCard
                title="Study Hours"
                value={analytics?.studyHours || 0}
                icon="schedule"
                iconBgColor="bg-secondary/10"
                iconColor="text-secondary"
                trend={{
                  direction: "up",
                  value: "5.2 hours more than last week"
                }}
              />
              
              <StatCard
                title="Resources Used"
                value={analytics?.resourcesUsed || 0}
                icon="auto_stories"
                iconBgColor="bg-accent/10"
                iconColor="text-accent"
                trend={{
                  direction: "up",
                  value: "7 new resources"
                }}
              />
              
              <StatCard
                title="AI Interactions"
                value={analytics?.aiInteractions || 0}
                icon="smart_toy"
                trend={{
                  direction: "none",
                  value: "Last: 2 hours ago"
                }}
              />
            </div>
          </section>
          
          {/* Paper Analysis & Upcoming Exams */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <PaperInsights papers={formattedPapers} />
            </div>
            
            <div>
              <ExamSchedule exams={upcomingExams || []} />
            </div>
          </div>
          
          {/* Resource Recommendations and AI Chatbot Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <StudyResources resources={recommendedResources || []} />
            </div>
            
            <div>
              <AIChatPreview 
                initialMessages={initialAIMessages}
                userId={activeUser.id}
              />
            </div>
          </div>
          
          {/* Community Activity */}
          <section>
            <h2 className="text-xl font-semibold font-poppins mb-4">Community Activity</h2>
            <CommunityActivity posts={communityPosts || []} />
          </section>
        </main>
      </div>
    </div>
  );
}
