import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { useStore, type Task } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Plus, Check, GripVertical, Clock } from "lucide-react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/today")({
  component: () => (
    <AppShell>
      <TodayPage />
    </AppShell>
  ),
});

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function TodayPage() {
  const tasks = useStore((s) => s.tasks);
  const plans = useStore((s) => s.daily_plans);
  const setIntent = useStore((s) => s.setDayIntent);
  const setOrder = useStore((s) => s.setDayOrder);
  const addTask = useStore((s) => s.addTask);
  const updateTask = useStore((s) => s.updateTask);

  const date = todayStr();
  const plan = plans[date] || { date, intent: "", order: [] };

  const candidates = useMemo(() => {
    const now = Date.now();
    return tasks.filter(
      (t) =>
        t.Status !== "DONE" &&
        t.Status !== "CANCELLED" &&
        new Date(t.Re_Evaluate_Timestamp).getTime() <= now + 86400000,
    );
  }, [tasks]);

  const ordered = useMemo(() => {
    const byId = new Map(candidates.map((t) => [t.Task_ID, t]));
    const sorted = plan.order.map((id) => byId.get(id)).filter(Boolean) as Task[];
    for (const t of candidates) if (!plan.order.includes(t.Task_ID)) sorted.push(t);
    return sorted;
  }, [candidates, plan.order]);

  const [quick, setQuick] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = ordered.map((t) => t.Task_ID);
    const from = ids.indexOf(active.id as string);
    const to = ids.indexOf(over.id as string);
    if (from < 0 || to < 0) return;
    setOrder(date, arrayMove(ids, from, to));
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold">תכנון היום</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString("he-IL", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      <Card className="p-4 space-y-2">
        <label className="text-sm font-bold">כוונה להיום</label>
        <Textarea
          value={plan.intent}
          onChange={(e) => setIntent(date, e.target.value)}
          placeholder="במשפט אחד: מה הכי חשוב להיום?"
          rows={2}
        />
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2">
            <Clock className="size-4" /> משימות להיום ({ordered.length})
          </h2>
        </div>

        <div className="flex gap-2">
          <Input
            value={quick}
            onChange={(e) => setQuick(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && quick.trim()) {
                const t = addTask({
                  Description: quick.trim(),
                  Re_Evaluate_Timestamp: new Date().toISOString(),
                });
                setOrder(date, [...plan.order, t.Task_ID]);
                setQuick("");
              }
            }}
            placeholder="הוספה מהירה למשימות היום..."
            className="text-sm"
          />
          <Button
            onClick={() => {
              if (!quick.trim()) return;
              const t = addTask({
                Description: quick.trim(),
                Re_Evaluate_Timestamp: new Date().toISOString(),
              });
              setOrder(date, [...plan.order, t.Task_ID]);
              setQuick("");
            }}
          >
            <Plus />
          </Button>
        </div>

        {ordered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            אין משימות שיועדו להיום. הוסף אחת למעלה ↑
          </p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ordered.map((t) => t.Task_ID)} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2">
                {ordered.map((t) => (
                  <SortableTodayRow key={t.Task_ID} task={t} onDone={() => updateTask(t.Task_ID, { Status: "DONE" })} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
      </Card>
    </div>
  );
}

function SortableTodayRow({ task, onDone }: { task: Task; onDone: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.Task_ID,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    borderInlineStartColor: task.color,
  } as React.CSSProperties;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-card p-2 border-s-4",
        isDragging && "opacity-50",
        !task.color && "border-s-border",
      )}
    >
      <button {...attributes} {...listeners} className="text-muted-foreground cursor-grab">
        <GripVertical className="size-4" />
      </button>
      <PriorityBadge value={task.AI_Urgency_Level} />
      <span className="flex-1 text-sm">{task.Description}</span>
      <Button size="sm" variant="ghost" className="h-7" onClick={onDone}>
        <Check className="size-3.5" /> בוצע
      </Button>
    </li>
  );
}
