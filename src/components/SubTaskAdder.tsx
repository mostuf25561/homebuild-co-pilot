import { useState, useMemo } from "react";
import { useStore, type Task } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, ChevronLeft } from "lucide-react";

/**
 * Add an existing task as a sub-task (sets parent_task_id),
 * or create a brand-new sub-task with the typed text.
 */
export function SubTaskAdder({ parentTask }: { parentTask: Task }) {
  const allTasks = useStore((s) => s.tasks);
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);
  const recordAction = useStore((s) => s.recordAction);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allTasks
      .filter(
        (t) =>
          t.Task_ID !== parentTask.Task_ID &&
          t.parent_task_id !== parentTask.Task_ID &&
          (q === "" || t.Description.toLowerCase().includes(q)),
      )
      .slice(0, 6);
  }, [allTasks, query, parentTask.Task_ID]);

  const subs = allTasks.filter((t) => t.parent_task_id === parentTask.Task_ID);

  return (
    <div className="space-y-2">
      {subs.length > 0 && (
        <ul className="space-y-1 ps-4 border-s-2 border-muted">
          {subs.map((s) => (
            <li key={s.Task_ID} className="text-xs flex items-center gap-1">
              <ChevronLeft className="size-3 text-muted-foreground" />
              <span className={s.Status === "DONE" ? "line-through text-muted-foreground" : ""}>
                {s.Description}
              </span>
            </li>
          ))}
        </ul>
      )}
      {!open ? (
        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setOpen(true)}>
          <Plus className="size-3" /> הוסף תת־משימה
        </Button>
      ) : (
        <div className="rounded-md border bg-muted/40 p-2 space-y-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפש משימה קיימת או הקלד תיאור חדש..."
            className="h-8 text-xs"
            autoFocus
          />
          {query.trim() && (
            <button
              className="w-full text-start text-xs px-2 py-1.5 rounded hover:bg-muted flex items-center gap-1.5 bg-primary/10 text-primary font-medium"
              onMouseDown={(e) => {
                e.preventDefault();
                const t = addTask({
                  Description: query.trim(),
                  parent_task_id: parentTask.Task_ID,
                });
                recordAction("add_subtask", `נוספה תת־משימה: ${t.Description}`);
                setQuery("");
                setOpen(false);
              }}
            >
              <Plus className="size-3" /> צור חדש: "{query.trim()}"
            </button>
          )}
          {candidates.length > 0 && (
            <ul className="max-h-40 overflow-auto rounded border bg-card">
              {candidates.map((c) => (
                <li key={c.Task_ID}>
                  <button
                    className="w-full text-start text-xs px-2 py-1.5 hover:bg-muted flex items-center gap-1.5"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      updateTask(c.Task_ID, { parent_task_id: parentTask.Task_ID });
                      recordAction("link_subtask", `${c.Task_ID} → תת־משימה של ${parentTask.Task_ID}`);
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
