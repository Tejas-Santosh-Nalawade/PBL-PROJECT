import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBgColor?: string;
  iconColor?: string;
  trend?: {
    direction: "up" | "down" | "none";
    value: string;
  };
}

export function StatCard({
  title,
  value,
  icon,
  iconBgColor = "bg-primary/10",
  iconColor = "text-primary",
  trend,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1)] p-5 hover:shadow-[0_4px_8px_rgba(0,0,0,0.12)] transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">{title}</p>
          <h3 className="text-2xl font-semibold font-poppins mt-1">{value}</h3>
        </div>
        <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", iconBgColor)}>
          <span className={cn("material-icons", iconColor)}>{icon}</span>
        </div>
      </div>
      {trend && (
        <div className="mt-2">
          <span className={cn(
            "text-sm flex items-center",
            trend.direction === "up" ? "text-secondary" : 
            trend.direction === "down" ? "text-destructive" : 
            "text-muted-foreground"
          )}>
            <span className="material-icons text-sm mr-1">
              {trend.direction === "up" ? "trending_up" : 
               trend.direction === "down" ? "trending_down" : 
               "history"}
            </span>
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
}

export default StatCard;
