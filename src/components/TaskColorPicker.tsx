import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const TASK_COLORS = [
  { name: "אדום", value: "#ef4444" },
  { name: "כתום", value: "#f59e0b" },
  { name: "צהוב", value: "#eab308" },
  { name: "ירוק", value: "#10b981" },
  { name: "תכלת", value: "#0ea5e9" },
  { name: "סגול", value: "#a855f7" },
  { name: "ורוד", value: "#ec4899" },
  { name: "אפור", value: "#64748b" },
] as const;

export function TaskColorPicker({ taskId, color }: { taskId: string; color?: string }) {
  const updateTask = useStore((s) => s.updateTask);
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <button
        type="button"
        onClick={() => updateTask(taskId, { color: undefined })}
        className={cn(
          "size-5 rounded-full border-2 bg-card flex items-center justify-center text-[10px] text-muted-foreground",
          !color ? "border-foreground" : "border-border",
        )}
        title="ללא צבע"
      >
        ×
      </button>
      {TASK_COLORS.map((c) => (
        <button
          type="button"
          key={c.value}
          onClick={() => updateTask(taskId, { color: c.value })}
          className={cn(
            "size-5 rounded-full border-2",
            color === c.value ? "border-foreground scale-110" : "border-transparent",
          )}
          style={{ backgroundColor: c.value }}
          title={c.name}
        />
      ))}
    </div>
  );
}
