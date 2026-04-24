import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  delta?: number;
  icon: LucideIcon;
  tint?: "primary" | "mint" | "warm" | "accent";
}

const tints: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  mint: "bg-secondary text-secondary-foreground",
  warm: "bg-gradient-warm text-foreground",
  accent: "bg-accent text-accent-foreground",
};

export function StatCard({ label, value, delta, icon: Icon, tint = "primary" }: StatCardProps) {
  const positive = (delta ?? 0) >= 0;
  return (
    <Card className="p-5 shadow-card border-border/60">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-display font-bold">{value}</p>
        </div>
        <div className={cn("h-10 w-10 rounded-xl grid place-items-center", tints[tint])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {typeof delta === "number" && (
        <div
          className={cn(
            "mt-3 inline-flex items-center gap-1 text-xs font-medium",
            positive ? "text-success" : "text-destructive",
          )}
        >
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(delta)}% vs last month
        </div>
      )}
    </Card>
  );
}
