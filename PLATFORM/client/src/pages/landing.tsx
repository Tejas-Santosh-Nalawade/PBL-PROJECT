import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

export default function Landing() {
  const [showMore, setShowMore] = useState(false);
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  const features = [
    {
      icon: "description",
      title: "Question Paper Analysis",
      description: "Upload and analyze question papers with AI to identify patterns and optimal study strategies."
    },
    {
      icon: "school",
      title: "Study Resources",
      description: "Access a curated collection of study materials tailored to your exams and learning style."
    },
    {
      icon: "smart_toy",
      title: "AI Study Assistant",
      description: "Get personalized help from our AI assistant powered by Google Gemini technology."
    },
    {
      icon: "forum",
      title: "Community Forum",
      description: "Connect with fellow students, ask questions, and share resources."
    },
    {
      icon: "video_library",
      title: "Video Resources",
      description: "Access educational videos to enhance your learning experience."
    },
    {
      icon: "insights",
      title: "Analytics Dashboard",
      description: "Track your study progress and identify areas for improvement."
    }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Computer Science Student",
      text: "The AI-powered question paper analysis helped me identify my weak areas and focus my studies effectively. I improved my grades significantly!"
    },
    {
      name: "David L.",
      role: "Engineering Major",
      text: "The study recommendations and AI assistant were like having a personal tutor available 24/7. Extremely helpful for complex topics."
    },
    {
      name: "Priya K.",
      role: "Mathematics Student",
      text: "The community forum connected me with peers who helped clarify difficult concepts. The collaborative environment made studying more engaging."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold font-poppins text-primary">
              <span className="text-secondary">Edu</span> AI
            </h1>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
            <Link href="/community" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Community</Link>
            <Link href="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Resources</Link>
          </div>
          <div className="flex items-center space-x-2">
            {isLoading ? (
              <Button variant="outline" disabled className="text-primary">
                <span className="animate-spin mr-2">◌</span> Loading...
              </Button>
            ) : user ? (
              <>
                <Button 
                  variant="outline" 
                  className="text-primary"
                  onClick={() => setLocation('/dashboard')}
                >
                  Dashboard
                </Button>
                <Button 
                  variant="default" 
                  className="bg-primary text-white"
                  onClick={() => setLocation('/ai-assistant')}
                >
                  AI Assistant
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="text-primary"
                  onClick={() => setLocation('/auth')}
                >
                  Sign In
                </Button>
                <Button 
                  variant="default" 
                  className="bg-primary text-white"
                  onClick={() => setLocation('/auth')}
                >
                  Enter Platform
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-primary/20 text-primary border-none">AI-Powered Learning</Badge>
              <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4 leading-tight">
                Transform Your Study Experience with AI
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Edu AI helps university students analyze question papers, manage study resources, and collaborate with peers using the power of AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-primary text-white"
                  onClick={() => {
                    if (user) {
                      setLocation('/dashboard');
                    } else {
                      setLocation('/auth');
                    }
                  }}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Students studying with digital resources" 
                className="rounded-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="mb-2">Features</Badge>
            <h2 className="text-3xl font-bold font-poppins mb-4">Supercharge Your Study Strategy</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines AI technology with educational best practices to help you study smarter, not harder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <span className="material-icons text-primary text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <Badge className="mb-2">Testimonials</Badge>
            <h2 className="text-3xl font-bold font-poppins mb-4">What Students Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from students who have transformed their studying approach with our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                      <span className="material-icons text-primary">person</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About section */}
      <section id="about" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-2">About Us</Badge>
              <h2 className="text-3xl font-bold font-poppins mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Edu AI was created with a simple goal: to make studying more efficient and effective for university students. By leveraging AI technology and collaborative learning, we aim to transform how students prepare for exams.
              </p>
              <div className={`space-y-4 ${showMore ? 'block' : 'hidden'}`}>
                <p className="text-muted-foreground">
                  Our team of educators and AI specialists has developed a unique approach to identify patterns in exam questions, create personalized study plans, and foster a supportive learning community.
                </p>
                <p className="text-muted-foreground">
                  We believe that with the right tools and insights, every student can achieve their academic goals while reducing stress and increasing confidence.
                </p>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => setShowMore(!showMore)}
                className="mt-4"
              >
                {showMore ? 'Show Less' : 'Read More'}
              </Button>
            </div>
            <div className="order-first md:order-last">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Team of educators and developers" 
                className="rounded-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary/10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold font-poppins mb-4">Ready to Transform Your Studies?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already improving their academic performance with our AI-powered platform.
          </p>
          <Button 
            size="lg" 
            className="bg-primary text-white"
            onClick={() => {
              if (user) {
                setLocation('/dashboard');
              } else {
                setLocation('/auth');
              }
            }}
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 font-poppins">
                <span className="text-secondary">Edu</span>
                <span className="text-primary"> AI</span>
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Transforming education through AI-powered insights and community collaboration.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><Link href="/dashboard"><span className="text-sm text-muted-foreground hover:text-primary transition-colors">Dashboard</span></Link></li>
                <li><Link href="/question-papers"><span className="text-sm text-muted-foreground hover:text-primary transition-colors">Question Papers</span></Link></li>
                <li><Link href="/study-resources"><span className="text-sm text-muted-foreground hover:text-primary transition-colors">Study Resources</span></Link></li>
                <li><Link href="/ai-assistant"><span className="text-sm text-muted-foreground hover:text-primary transition-colors">AI Assistant</span></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">Connect</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Support</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Feedback</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Edu AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}