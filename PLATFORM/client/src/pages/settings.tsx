import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Mock user for development
const mockUser = {
  id: 1,
  name: "Alex Johnson",
  username: "alex.johnson",
  firstName: "Alex",
  lastName: "Johnson",
  email: "alex.johnson@example.com",
  image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
};

const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  profileImage: z.string().optional(),
});

const securityFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  examReminders: z.boolean(),
  studyRecommendations: z.boolean(),
  communityUpdates: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type SecurityFormValues = z.infer<typeof securityFormSchema>;
type NotificationSettingsValues = z.infer<typeof notificationSettingsSchema>;

export default function Settings() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
      email: mockUser.email,
      profileImage: mockUser.image,
    },
  });

  // Security form
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Notification settings form
  const notificationForm = useForm<NotificationSettingsValues>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      examReminders: true,
      studyRecommendations: true,
      communityUpdates: false,
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const response = await apiRequest("PATCH", `/api/users/${mockUser.id}`, values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${mockUser.id}`] });
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (values: SecurityFormValues) => {
      const response = await apiRequest("PATCH", `/api/users/${mockUser.id}/password`, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      return response.json();
    },
    onSuccess: () => {
      securityForm.reset();
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update password: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Update notification settings mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (values: NotificationSettingsValues) => {
      const response = await apiRequest("PATCH", `/api/users/${mockUser.id}/notifications`, values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update notification settings: " + error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitProfile = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };

  const onSubmitSecurity = (values: SecurityFormValues) => {
    updatePasswordMutation.mutate(values);
  };

  const onSubmitNotifications = (values: NotificationSettingsValues) => {
    updateNotificationsMutation.mutate(values);
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
          title="Settings" 
          user={mockUser} 
        />
        
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold font-poppins mb-2">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Settings Navigation */}
            <Card className="md:col-span-1">
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <Button
                    variant={activeTab === "profile" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("profile")}
                  >
                    <span className="material-icons mr-2 text-sm">person</span>
                    Profile
                  </Button>
                  <Button
                    variant={activeTab === "security" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("security")}
                  >
                    <span className="material-icons mr-2 text-sm">shield</span>
                    Security
                  </Button>
                  <Button
                    variant={activeTab === "notifications" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("notifications")}
                  >
                    <span className="material-icons mr-2 text-sm">notifications</span>
                    Notifications
                  </Button>
                  <Button
                    variant={activeTab === "appearance" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("appearance")}
                  >
                    <span className="material-icons mr-2 text-sm">palette</span>
                    Appearance
                  </Button>
                  <Separator className="my-2" />
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <span className="material-icons mr-2 text-sm">logout</span>
                    Sign out
                  </Button>
                </nav>
              </CardContent>
            </Card>

            {/* Settings Content */}
            <Card className="md:col-span-4">
              {/* Profile Settings */}
              {activeTab === "profile" && (
                <>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                    <CardDescription>
                      Update your personal information and profile picture
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center">
                      <Avatar className="h-20 w-20 mr-4">
                        <AvatarImage src={mockUser.image} alt={mockUser.name} />
                        <AvatarFallback>
                          {mockUser.firstName?.[0]}{mockUser.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Button variant="outline" size="sm" className="mb-2">
                          <span className="material-icons mr-2 text-sm">upload</span>
                          Change Avatar
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG or GIF. 1MB max.
                        </p>
                      </div>
                    </div>

                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={profileForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={profileForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            className="bg-primary text-white"
                            disabled={updateProfileMutation.isPending}
                          >
                            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </>
              )}

              {/* Security Settings */}
              {activeTab === "security" && (
                <>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Update your password and security preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Form {...securityForm}>
                      <form onSubmit={securityForm.handleSubmit(onSubmitSecurity)} className="space-y-4">
                        <FormField
                          control={securityForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={securityForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormDescription>
                                Password must be at least 8 characters long.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={securityForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Separator className="my-4" />
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
                            <p className="text-sm text-muted-foreground">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <Switch disabled />
                        </div>
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            className="bg-primary text-white"
                            disabled={updatePasswordMutation.isPending}
                          >
                            {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </>
              )}

              {/* Notification Settings */}
              {activeTab === "notifications" && (
                <>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                      Configure how and when you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Form {...notificationForm}>
                      <form onSubmit={notificationForm.handleSubmit(onSubmitNotifications)} className="space-y-6">
                        <FormField
                          control={notificationForm.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Email Notifications</FormLabel>
                                <FormDescription>
                                  Receive notifications via email
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Separator />
                        <FormField
                          control={notificationForm.control}
                          name="examReminders"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Exam Reminders</FormLabel>
                                <FormDescription>
                                  Get notifications about upcoming exams
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Separator />
                        <FormField
                          control={notificationForm.control}
                          name="studyRecommendations"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Study Recommendations</FormLabel>
                                <FormDescription>
                                  Receive personalized study material recommendations
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Separator />
                        <FormField
                          control={notificationForm.control}
                          name="communityUpdates"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Community Updates</FormLabel>
                                <FormDescription>
                                  Get notified about new posts and replies in the community
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end">
                          <Button 
                            type="submit" 
                            className="bg-primary text-white"
                            disabled={updateNotificationsMutation.isPending}
                          >
                            {updateNotificationsMutation.isPending ? "Saving..." : "Save Preferences"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </>
              )}

              {/* Appearance Settings */}
              {activeTab === "appearance" && (
                <>
                  <CardHeader>
                    <CardTitle>Appearance Settings</CardTitle>
                    <CardDescription>
                      Customize the appearance of the application
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base">Theme</Label>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          <Button variant="outline" className="h-auto flex-col items-center justify-center py-4 px-2 gap-2 w-full">
                            <span className="material-icons">light_mode</span>
                            <span className="text-xs">Light</span>
                          </Button>
                          <Button variant="outline" className="h-auto flex-col items-center justify-center py-4 px-2 gap-2 w-full">
                            <span className="material-icons">dark_mode</span>
                            <span className="text-xs">Dark</span>
                          </Button>
                          <Button variant="outline" className="h-auto flex-col items-center justify-center py-4 px-2 gap-2 w-full bg-primary/10 border-primary">
                            <span className="material-icons">devices</span>
                            <span className="text-xs">System</span>
                          </Button>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <Label className="text-base">Font Size</Label>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          <Button variant="outline" className="h-auto flex-col items-center justify-center py-4 px-2 gap-2 w-full">
                            <span className="text-xs">Small</span>
                          </Button>
                          <Button variant="outline" className="h-auto flex-col items-center justify-center py-4 px-2 gap-2 w-full bg-primary/10 border-primary">
                            <span className="text-sm">Medium</span>
                          </Button>
                          <Button variant="outline" className="h-auto flex-col items-center justify-center py-4 px-2 gap-2 w-full">
                            <span className="text-base">Large</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-end">
                      <Button className="bg-primary text-white">
                        Save Appearance
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
