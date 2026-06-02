import type { Status } from "@/lib/store";
import { cn } from "@/lib/utils";

const LABEL: Record<string, string> = {
  ACTIVE: "פעיל",
  DONE: "הושלם",
  CANCELLED: "בוטל",
  Pending: "ממתין",
  In_Progress: "בביצוע",
  Flagged_Risk: "סומן כסיכון",
  Delayed: "נדחה",
};

export function StatusPill({ value }: { value: Status }) {
  const isRisk = value === "Flagged_Risk";
  const isDone = value === "DONE";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        isRisk && "border-destructive/40 bg-destructive/10 text-destructive",
        isDone && "border-low/40 bg-low/20 text-foreground",
        !isRisk && !isDone && "border-border bg-muted text-muted-foreground",
      )}
    >
      {LABEL[value] || value}
    </span>
  );
}
