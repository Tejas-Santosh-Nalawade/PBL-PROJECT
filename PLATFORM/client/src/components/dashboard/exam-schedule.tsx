import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface Exam {
  id: number;
  name: string;
  type: string;
  date: string;
  time: string;
  daysLeft: number;
  readiness: number;
}

interface ExamScheduleProps {
  exams: Exam[];
}

function getDaysLeftColor(daysLeft: number): string {
  if (daysLeft <= 2) return "border-accent bg-accent/5";
  if (daysLeft <= 7) return "border-primary bg-primary/5";
  return "border-muted-foreground bg-muted/30";
}

function getDaysLeftBadgeColor(daysLeft: number): string {
  if (daysLeft <= 2) return "bg-accent/20 text-accent";
  if (daysLeft <= 7) return "bg-primary/20 text-primary";
  return "bg-muted text-muted-foreground";
}

export function ExamSchedule({ exams }: ExamScheduleProps) {
  return (
    <Card>
      <CardHeader className="px-6 py-4 flex flex-row items-center justify-between border-b">
        <CardTitle className="text-base font-semibold">Upcoming Exams</CardTitle>
        <Button variant="link" size="sm" className="text-primary">
          Add Exam
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className={cn(
              "p-3 border-l-4 rounded mb-3",
              getDaysLeftColor(exam.daysLeft)
            )}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{exam.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{exam.type}</p>
              </div>
              <div className={cn(
                "text-xs font-medium px-2 py-1 rounded-full",
                getDaysLeftBadgeColor(exam.daysLeft)
              )}>
                {exam.daysLeft <= 1
                  ? "Tomorrow!"
                  : exam.daysLeft === 1 
                  ? "1 day left" 
                  : `${exam.daysLeft} days left`}
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-muted-foreground">
              <span className="material-icons text-muted-foreground mr-1 text-sm">calendar_today</span>
              {exam.date} • {exam.time}
            </div>
            <div className="mt-2 pt-2 border-t flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Progress value={exam.readiness} className="w-20 h-1.5" />
                <span className="text-xs text-muted-foreground">{exam.readiness}% ready</span>
              </div>
              <Link href={`/exam/${exam.id}/study-plan`}>
                <Button variant="link" size="sm" className="text-primary">
                  Study Plan
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default ExamSchedule;
