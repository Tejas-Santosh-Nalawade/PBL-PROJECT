import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address").optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();

  // Setup effect for redirect when authenticated
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Login form setup
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form setup
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  // Reset errors when switching tabs
  useEffect(() => {
    setLoginError(null);
    setRegisterError(null);
  }, [activeTab]);

  // Handle login mutation errors
  useEffect(() => {
    if (loginMutation.error) {
      setLoginError(loginMutation.error.message || 'Login failed. Please try again.');
    } else {
      setLoginError(null);
    }
  }, [loginMutation.error]);

  // Handle register mutation errors
  useEffect(() => {
    if (registerMutation.error) {
      setRegisterError(registerMutation.error.message || 'Registration failed. Please try again.');
    } else {
      setRegisterError(null);
    }
  }, [registerMutation.error]);

  const onLoginSubmit = (data: LoginFormValues) => {
    setLoginError(null);
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    setRegisterError(null);
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex">
      {/* Form Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center bg-background p-8">
        <Link href="/">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold font-poppins">
              <span className="text-secondary">Edu</span>
              <span className="text-primary"> AI</span>
            </h1>
          </div>
        </Link>

        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome</CardTitle>
            <CardDescription className="text-center">
              Sign in or create an account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-0">
            <Tabs
              defaultValue="login"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Create Account</TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    {loginError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{loginError}</AlertDescription>
                      </Alert>
                    )}
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-primary text-white"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Sign In
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              {/* Register Tab */}
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    {registerError && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertDescription>{registerError}</AlertDescription>
                      </Alert>
                    )}
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="First name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Last name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Create a password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full bg-primary text-white"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Create Account
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/">
              <Button variant="ghost" size="sm">
                Back to Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Hero Section */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex flex-col justify-center items-center h-full p-8">
          <div className="max-w-md text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              Elevate Your Learning Experience
            </h2>
            <p className="text-muted-foreground mb-6">
              Join Edu AI to analyze exam patterns, access personalized study materials, 
              and connect with peers to improve your academic performance.
            </p>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/80 rounded-lg p-4 shadow-sm">
                <div className="font-bold text-3xl text-primary mb-2">100+</div>
                <div className="text-sm text-muted-foreground">Universities</div>
              </div>
              <div className="bg-white/80 rounded-lg p-4 shadow-sm">
                <div className="font-bold text-3xl text-primary mb-2">10k+</div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
              <div className="bg-white/80 rounded-lg p-4 shadow-sm">
                <div className="font-bold text-3xl text-primary mb-2">50k+</div>
                <div className="text-sm text-muted-foreground">Papers Analyzed</div>
              </div>
              <div className="bg-white/80 rounded-lg p-4 shadow-sm">
                <div className="font-bold text-3xl text-primary mb-2">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}