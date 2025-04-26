import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Resource {
  id: number;
  title: string;
  description: string;
  type: 'Book' | 'Video Course' | 'Article' | 'Practice Set';
  thumbnail?: string;
  rating: number;
  reviews: number;
  addedDays: number;
  bookmarked?: boolean;
}

interface StudyResourcesProps {
  resources: Resource[];
}

function getResourceTypeColor(type: string): {bg: string, text: string} {
  switch (type) {
    case 'Book':
      return { bg: 'bg-primary/10', text: 'text-primary' };
    case 'Video Course':
      return { bg: 'bg-red-100', text: 'text-red-600' };
    case 'Article':
      return { bg: 'bg-secondary/10', text: 'text-secondary' };
    case 'Practice Set':
      return { bg: 'bg-accent/10', text: 'text-accent' };
    default:
      return { bg: 'bg-muted', text: 'text-muted-foreground' };
  }
}

function getResourceIcon(type: string): string {
  switch (type) {
    case 'Book':
      return 'auto_stories';
    case 'Video Course':
      return 'play_arrow';
    case 'Article':
      return 'article';
    case 'Practice Set':
      return 'history_edu';
    default:
      return 'description';
  }
}

export function StudyResources({ resources }: StudyResourcesProps) {
  return (
    <Card>
      <CardHeader className="px-6 py-4 flex flex-row items-center justify-between border-b">
        <CardTitle className="text-base font-semibold">Recommended Resources</CardTitle>
        <Link href="/study-resources">
          <Button variant="link" size="sm" className="text-primary">
            Browse Library
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource) => {
            const typeColors = getResourceTypeColor(resource.type);
            
            return (
              <div
                key={resource.id}
                className="border rounded-lg p-4 hover:shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-shadow cursor-pointer"
              >
                <div className="flex items-start">
                  <div className="h-12 w-12 flex-shrink-0 rounded overflow-hidden mr-3">
                    {resource.thumbnail ? (
                      <img
                        src={resource.thumbnail}
                        alt={`${resource.title} cover`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className={cn("h-full w-full flex items-center justify-center", typeColors.bg, typeColors.text)}>
                        <span className="material-icons">
                          {getResourceIcon(resource.type)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{resource.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {resource.description}
                    </p>
                    <div className="flex items-center mt-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span 
                            key={i} 
                            className={cn(
                              "material-icons text-sm",
                              i < Math.floor(resource.rating) 
                                ? "text-accent" 
                                : i < resource.rating 
                                ? "text-accent" // For half stars, we'll use the same color for simplicity
                                : "text-muted-foreground"
                            )}
                          >
                            {i < Math.floor(resource.rating) 
                              ? "star" 
                              : i < resource.rating 
                              ? "star_half" 
                              : "star_outline"}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({resource.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t">
                  <div className="flex items-center">
                    <Badge variant="secondary" className={cn(typeColors.bg, typeColors.text, "rounded")}>
                      {resource.type}
                    </Badge>
                    <span className="ml-2 text-xs text-muted-foreground">
                      Added {resource.addedDays === 0 
                        ? "today" 
                        : resource.addedDays === 1 
                        ? "yesterday" 
                        : `${resource.addedDays} days ago`}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="text-primary">
                    <span className="material-icons">
                      {resource.bookmarked ? "bookmark" : "bookmark_border"}
                    </span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default StudyResources;
