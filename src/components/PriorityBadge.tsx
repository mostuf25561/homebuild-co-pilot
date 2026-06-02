import type { Priority } from "@/lib/store";
import { cn } from "@/lib/utils";

const MAP: Record<Priority, { label: string; cls: string }> = {
  CRITICAL: { label: "קריטי", cls: "bg-critical text-critical-foreground" },
  HIGH: { label: "גבוה", cls: "bg-high text-high-foreground" },
  MEDIUM: { label: "בינוני", cls: "bg-medium text-medium-foreground" },
  LOW: { label: "נמוך", cls: "bg-low text-low-foreground" },
};

export function PriorityBadge({ value }: { value: Priority }) {
  const m = MAP[value] || MAP.MEDIUM;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", m.cls)}>
      {m.label}
    </span>
  );
}
