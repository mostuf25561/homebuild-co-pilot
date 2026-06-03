import { useState, useMemo } from "react";
import { useStore, type Task, type RelationKind } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, X, ArrowLeft, ArrowRight, GitBranch, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const KIND_META: Record<RelationKind, { label: string; cls: string; icon: typeof ArrowLeft }> = {
  before: { label: "אחרי (תלוי ב־)", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40", icon: ArrowRight },
  after: { label: "לפני (חוסם את)", cls: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/40", icon: ArrowLeft },
  parallel: { label: "במקביל", cls: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/40", icon: GitBranch },
};

export function TaskRelationsEditor({ task }: { task: Task }) {
  const allTasks = useStore((s) => s.tasks);
  const addRelation = useStore((s) => s.addRelation);
  const removeRelation = useStore((s) => s.removeRelation);
  const recordAction = useStore((s) => s.recordAction);

  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<RelationKind>("before");
  const [open, setOpen] = useState(false);

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allTasks
      .filter((t) => t.Task_ID !== task.Task_ID && t.Description.toLowerCase().includes(q))
      .slice(0, 6);
  }, [allTasks, query, task.Task_ID]);

  const taskById = (id: string) => allTasks.find((t) => t.Task_ID === id);

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
                onClick={() => {
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
      {!open ? (
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setOpen(true)}>
          <Link2 className="size-3" /> הוסף קישור
        </Button>
      ) : (
        <div className="rounded-md border bg-muted/40 p-2 space-y-2">
          <div className="flex gap-1.5 items-center">
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
          />
          {candidates.length > 0 && (
            <ul className="max-h-40 overflow-auto rounded border bg-card">
              {candidates.map((c) => (
                <li key={c.Task_ID}>
                  <button
                    className="w-full text-start text-xs px-2 py-1.5 hover:bg-muted flex items-center gap-1.5"
                    onClick={() => {
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
