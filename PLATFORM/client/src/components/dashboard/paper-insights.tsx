import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface PaperTag {
  name: string;
}

interface PaperMetric {
  label: string;
  value: string;
}

interface PaperInsight {
  id: number;
  title: string;
  daysAgo: number;
  tags: PaperTag[];
  metrics: PaperMetric[];
}

interface PaperInsightsProps {
  papers: PaperInsight[];
}

export function PaperInsights({ papers }: PaperInsightsProps) {
  return (
    <Card>
      <CardHeader className="px-6 py-4 flex flex-row items-center justify-between border-b">
        <CardTitle className="text-base font-semibold">Recent Paper Analysis</CardTitle>
        <Link href="/question-papers">
          <Button variant="link" size="sm" className="text-primary">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-6">
        {papers.map((paper, index) => (
          <div 
            key={paper.id}
            className={`mb-4 pb-4 ${index < papers.length - 1 ? 'border-b' : ''} last:pb-0 last:mb-0`}
          >
            <div className="flex items-start">
              <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center mr-4 shrink-0">
                <span className="material-icons text-primary">description</span>
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                  <h4 className="font-medium">{paper.title}</h4>
                  <span className="text-sm text-muted-foreground mt-1 sm:mt-0">
                    Analyzed {paper.daysAgo} {paper.daysAgo === 1 ? 'day' : 'days'} ago
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {paper.tags.map((tag, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className="bg-muted text-xs font-medium rounded-full"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 text-sm">
                  {paper.metrics.map((metric, idx) => (
                    <div key={idx} className="p-2 bg-muted rounded">
                      <p className="text-muted-foreground text-xs">{metric.label}</p>
                      <p className="font-medium">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default PaperInsights;
