import { useState, useMemo } from "react";
import { useStore, type Task, type RelationKind } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, X, ArrowLeft, ArrowRight, GitBranch, Plus, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const KIND_META: Record<RelationKind, { label: string; cls: string; icon: typeof ArrowLeft }> = {
  before: { label: "אחרי (תלוי ב־)", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40", icon: ArrowRight },
  after: { label: "לפני (חוסם את)", cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/40", icon: ArrowLeft },
  parallel: { label: "במקביל", cls: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/40", icon: GitBranch },
  related: { label: "קשור", cls: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/40", icon: LinkIcon },
};

export function TaskRelationsEditor({ task }: { task: Task }) {
  const allTasks = useStore((s) => s.tasks);
  const addRelation = useStore((s) => s.addRelation);
  const removeRelation = useStore((s) => s.removeRelation);
  const updateTask = useStore((s) => s.updateTask);
  const recordAction = useStore((s) => s.recordAction);

  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<RelationKind>("before");
  const [open, setOpen] = useState(false);

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allTasks.filter((t) => t.Task_ID !== task.Task_ID).slice(0, 6);
    return allTasks
      .filter((t) => t.Task_ID !== task.Task_ID && t.Description.toLowerCase().includes(q))
      .slice(0, 6);
  }, [allTasks, query, task.Task_ID]);

  const taskById = (id: string) => allTasks.find((t) => t.Task_ID === id);
  const hasChrono = task.relations.some((r) => r.kind === "before" || r.kind === "after");

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {task.relations.length === 0 && (
          <span className="text-xs text-muted-foreground">אין משימות מקושרות</span>
        )}
        {task.relations.map((rel) => {
          const other = taskById(rel.task_id);
          const meta = KIND_META[rel.kind];
          const Icon = meta.icon;
          const name = other?.Description || `[${rel.task_id}]`;
          return (
            <span
              key={`${rel.kind}-${rel.task_id}`}
              className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs", meta.cls)}
            >
              <Icon className="size-3" />
              <span className="font-medium" title={other?.Description}>
                {name}
              </span>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  removeRelation(task.Task_ID, rel.task_id, rel.kind);
                  recordAction("remove_relation", `הסרת קישור בין ${task.Task_ID} ל־${rel.task_id}`);
                }}
                className="opacity-60 hover:opacity-100"
                title="הסרת קישור"
              >
                <X className="size-3" />
              </button>
            </span>
          );
        })}
      </div>

      {hasChrono && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">סדר ביצוע:</span>
          <Input
            type="number"
            value={task.chrono_order ?? ""}
            onChange={(e) =>
              updateTask(task.Task_ID, {
                chrono_order: e.target.value === "" ? undefined : Number(e.target.value),
              })
            }
            className="h-7 w-20 text-xs"
            placeholder="—"
          />
        </div>
      )}

      {!open ? (
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setOpen(true)}>
          <Link2 className="size-3" /> הוסף קישור
        </Button>
      ) : (
        <div className="rounded-md border bg-muted/40 p-2 space-y-2">
          <div className="flex gap-1.5 items-center flex-wrap">
            {(Object.keys(KIND_META) as RelationKind[]).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={cn(
                  "px-2 py-0.5 rounded text-xs border",
                  kind === k ? KIND_META[k].cls : "border-border text-muted-foreground",
                )}
              >
                {KIND_META[k].label}
              </button>
            ))}
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש משימה לפי שם..."
            className="h-8 text-xs"
            autoFocus
          />
          {candidates.length > 0 && (
            <ul className="max-h-40 overflow-auto rounded border bg-card">
              {candidates.map((c) => (
                <li key={c.Task_ID}>
                  <button
                    className="w-full text-start text-xs px-2 py-1.5 hover:bg-muted flex items-center gap-1.5"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addRelation(task.Task_ID, { kind, task_id: c.Task_ID });
                      recordAction("add_relation", `הוספת קישור ${kind} בין ${task.Task_ID} ל־${c.Task_ID}`);
                      setQuery("");
                      setOpen(false);
                    }}
                  >
                    <Plus className="size-3" />
                    {c.Description}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setOpen(false)}>
            ביטול
          </Button>
        </div>
      )}
    </div>
  );
}
