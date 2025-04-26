import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface CommunityPost {
  id: number;
  title: string;
  content: string;
  author: {
    id: number;
    name: string;
    avatar?: string;
  };
  timeAgo: string;
  likes: number;
  comments: number;
  solved?: boolean;
  hasRepository?: boolean;
}

interface CommunityActivityProps {
  posts: CommunityPost[];
}

export function CommunityActivity({ posts }: CommunityActivityProps) {
  return (
    <Card>
      <CardHeader className="px-6 py-4 flex flex-row items-center justify-between border-b">
        <CardTitle className="text-base font-semibold">Recent Discussions</CardTitle>
        <Link href="/community">
          <Button variant="link" size="sm" className="text-primary">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0 divide-y">
        {posts.map((post) => (
          <div key={post.id} className="p-4 hover:bg-muted/20 transition-colors">
            <div className="flex">
              <Avatar className="h-10 w-10 mr-3">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{post.title}</h4>
                  <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {post.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary text-sm flex items-center">
                      <span className="material-icons text-sm mr-1">thumb_up</span>
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary text-sm flex items-center">
                      <span className="material-icons text-sm mr-1">comment</span>
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary text-sm flex items-center">
                      <span className="material-icons text-sm mr-1">share</span>
                      Share
                    </Button>
                  </div>
                  <div>
                    {post.solved && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        Solved
                      </Badge>
                    )}
                    {post.hasRepository && (
                      <Button variant="link" size="sm" className="text-primary text-sm ml-2">
                        View Repository
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="p-4 border-t">
        <Button variant="outline" className="w-full font-medium border-primary text-primary hover:bg-primary/5">
          Start a New Discussion
        </Button>
      </CardFooter>
    </Card>
  );
}

export default CommunityActivity;
