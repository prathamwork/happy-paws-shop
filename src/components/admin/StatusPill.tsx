import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  pending: "bg-warning/15 text-[hsl(var(--warning))]",
  shipped: "bg-primary/15 text-primary",
  delivered: "bg-success/15 text-[hsl(var(--success))]",
  cancelled: "bg-destructive/15 text-destructive",
  paid: "bg-success/15 text-[hsl(var(--success))]",
  unpaid: "bg-warning/15 text-[hsl(var(--warning))]",
  refunded: "bg-muted text-muted-foreground",
  approved: "bg-success/15 text-[hsl(var(--success))]",
  rejected: "bg-destructive/15 text-destructive",
  active: "bg-success/15 text-[hsl(var(--success))]",
  inactive: "bg-muted text-muted-foreground",
};

export function StatusPill({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize",
        styles[value] ?? "bg-muted text-muted-foreground",
      )}
    >
      {value}
    </span>
  );
}
