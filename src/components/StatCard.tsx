import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
}

export function StatCard({ title, value, subtitle, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-muted-foreground">{title}</p>
          <p className="text-2xl font-extrabold text-card-foreground">{value}</p>
          {subtitle && <p className="text-xs font-light text-muted-foreground">{subtitle}</p>}
          {trend && (
            <p className={`text-xs font-semibold ${trend.positive ? "text-success" : "text-destructive"}`}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-3">
          <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}
