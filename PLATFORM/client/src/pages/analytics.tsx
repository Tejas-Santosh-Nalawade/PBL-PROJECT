import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { format, subDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Mock user for development
const mockUser = {
  id: 1,
  name: "Alex Johnson",
  username: "alex.johnson",
  firstName: "Alex",
  image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
};

// Chart colors
const COLORS = ["#4285F4", "#34A853", "#FBBC05", "#EA4335", "#5F6368"];

export default function Analytics() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("weekly");
  const { toast } = useToast();

  // Generate mock data for the demo
  // In a real app, this would be fetched from the API
  const generateMockData = (range: string) => {
    const today = new Date();
    let days = 7;
    
    if (range === "monthly") {
      days = 30;
    } else if (range === "yearly") {
      days = 365;
    }
    
    // Study activity data
    const studyActivity = Array.from({ length: days }, (_, i) => {
      const date = subDays(today, days - 1 - i);
      return {
        date: format(date, "MMM dd"),
        studyHours: Math.random() * 5 + 0.5, // 0.5 to 5.5 hours
        papersAnalyzed: Math.floor(Math.random() * 3), // 0 to 2 papers
        resourcesUsed: Math.floor(Math.random() * 5), // 0 to 4 resources
        aiInteractions: Math.floor(Math.random() * 10), // 0 to 9 interactions
      };
    });
    
    // Subject distribution data
    const subjects = ["Computer Science", "Mathematics", "Physics", "Engineering", "Other"];
    const subjectDistribution = subjects.map(subject => ({
      name: subject,
      value: Math.floor(Math.random() * 40) + 10, // 10 to 49 hours
    }));
    
    // Resource usage data
    const resourceTypes = ["Books", "Articles", "Videos", "Practice Sets", "AI Assistance"];
    const resourceUsage = resourceTypes.map(type => ({
      name: type,
      count: Math.floor(Math.random() * 50) + 5, // 5 to 54 resources
    }));
    
    // Performance metrics
    const performanceMetrics = {
      testScores: Math.floor(Math.random() * 30) + 70, // 70% to 99%
      completionRate: Math.floor(Math.random() * 25) + 75, // 75% to 99%
      consistencyScore: Math.floor(Math.random() * 40) + 60, // 60 to 99
      productivityIndex: Math.floor(Math.random() * 30) + 70, // 70 to 99
    };
    
    return {
      studyActivity,
      subjectDistribution,
      resourceUsage,
      performanceMetrics,
    };
  };

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/analytics", mockUser.id, timeRange],
    queryFn: () => {
      // In a real app, this would fetch from the API
      return Promise.resolve(generateMockData(timeRange));
    },
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Calculate totals
  const calculateTotals = () => {
    if (!analyticsData) return { studyHours: 0, papers: 0, resources: 0, interactions: 0 };
    
    return analyticsData.studyActivity.reduce((acc, day) => {
      return {
        studyHours: acc.studyHours + day.studyHours,
        papers: acc.papers + day.papersAnalyzed,
        resources: acc.resources + day.resourcesUsed,
        interactions: acc.interactions + day.aiInteractions,
      };
    }, { studyHours: 0, papers: 0, resources: 0, interactions: 0 });
  };

  const totals = calculateTotals();

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
          title="Analytics" 
          user={mockUser} 
        />
        
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold font-poppins mb-2">Study Analytics</h1>
              <p className="text-muted-foreground">
                Track your study progress and identify areas for improvement
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Tabs 
                value={timeRange} 
                onValueChange={setTimeRange}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 w-[300px]">
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="h-20 bg-muted"></CardHeader>
                  <CardContent className="h-12 bg-muted mt-2"></CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Study Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totals.studyHours.toFixed(1)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="inline-flex items-center text-secondary">
                        <span className="material-icons text-sm mr-1">trending_up</span>
                        12.5% from previous {timeRange === "weekly" ? "week" : timeRange === "monthly" ? "month" : "year"}
                      </span>
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Papers Analyzed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(totals.papers)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="inline-flex items-center text-secondary">
                        <span className="material-icons text-sm mr-1">trending_up</span>
                        3 new this {timeRange === "weekly" ? "week" : timeRange === "monthly" ? "month" : "year"}
                      </span>
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Resources Used
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(totals.resources)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="inline-flex items-center text-secondary">
                        <span className="material-icons text-sm mr-1">trending_up</span>
                        7 new resources accessed
                      </span>
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      AI Interactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(totals.interactions)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="inline-flex items-center text-muted-foreground">
                        <span className="material-icons text-sm mr-1">history</span>
                        Last: 2 hours ago
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              {/* Study Activity Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Study Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analyticsData?.studyActivity}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="studyHours" 
                          name="Study Hours" 
                          stroke="#4285F4" 
                          activeDot={{ r: 8 }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="resourcesUsed" 
                          name="Resources Used" 
                          stroke="#34A853" 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="aiInteractions" 
                          name="AI Interactions" 
                          stroke="#FBBC05" 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Subject Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData?.subjectDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analyticsData?.subjectDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              
              {/* Resource Usage and Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Resource Usage</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analyticsData?.resourceUsage}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" name="Usage Count" fill="#4285F4" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Test Scores</span>
                          <span className="text-sm font-semibold">
                            {analyticsData?.performanceMetrics.testScores}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${analyticsData?.performanceMetrics.testScores}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Completion Rate</span>
                          <span className="text-sm font-semibold">
                            {analyticsData?.performanceMetrics.completionRate}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-secondary" 
                            style={{ width: `${analyticsData?.performanceMetrics.completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Consistency Score</span>
                          <span className="text-sm font-semibold">
                            {analyticsData?.performanceMetrics.consistencyScore}/100
                          </span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent" 
                            style={{ width: `${analyticsData?.performanceMetrics.consistencyScore}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Productivity Index</span>
                          <span className="text-sm font-semibold">
                            {analyticsData?.performanceMetrics.productivityIndex}/100
                          </span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-destructive" 
                            style={{ width: `${analyticsData?.performanceMetrics.productivityIndex}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
