import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useStore, type Priority, type Objective } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusPill } from "@/components/StatusPill";
import { Plus, Trash2, Pencil, Check } from "lucide-react";

export const Route = createFileRoute("/objectives")({
  component: () => (
    <AppShell>
      <ObjectivesPage />
    </AppShell>
  ),
});

const PRIORITIES: Priority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

function ObjectivesPage() {
  const objectives = useStore((s) => s.objectives);
  const addObjective = useStore((s) => s.addObjective);
  const [adding, setAdding] = useState(false);
  const [newObj, setNewObj] = useState({ Category: "", The_Goal: "", Priority_Level: "MEDIUM" as Priority });

  const grouped = objectives.reduce<Record<string, Objective[]>>((acc, o) => {
    (acc[o.Category] ||= []).push(o);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">מטרות ורצונות לפי קטגוריה</h1>
          <p className="text-sm text-muted-foreground mt-1">
            המטרות המרכזיות בפרויקט, מאוגדות לפי תחום פעילות.
          </p>
        </div>
        <Button onClick={() => setAdding((v) => !v)}>
          <Plus /> מטרה חדשה
        </Button>
      </div>

      {adding && (
        <Card className="p-4 space-y-3 border-primary">
          <Input
            placeholder="קטגוריה"
            value={newObj.Category}
            onChange={(e) => setNewObj({ ...newObj, Category: e.target.value })}
          />
          <Textarea
            placeholder="תיאור המטרה"
            value={newObj.The_Goal}
            onChange={(e) => setNewObj({ ...newObj, The_Goal: e.target.value })}
          />
          <div className="flex items-center gap-2">
            <select
              className="border rounded-md px-2 py-1 text-sm bg-background"
              value={newObj.Priority_Level}
              onChange={(e) => setNewObj({ ...newObj, Priority_Level: e.target.value as Priority })}
            >
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <div className="flex-1" />
            <Button
              onClick={() => {
                if (!newObj.The_Goal.trim()) return;
                addObjective(newObj);
                setNewObj({ Category: "", The_Goal: "", Priority_Level: "MEDIUM" });
                setAdding(false);
              }}
            >
              <Check /> שמור
            </Button>
          </div>
        </Card>
      )}

      {Object.entries(grouped).map(([cat, items]) => (
        <section key={cat} className="space-y-3">
          <h2 className="text-lg font-bold border-b pb-2">{cat}</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {items.map((o) => <ObjectiveCard key={o.Objective_ID} objective={o} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

function ObjectiveCard({ objective }: { objective: Objective }) {
  const update = useStore((s) => s.updateObjective);
  const del = useStore((s) => s.deleteObjective);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(objective);

  if (editing) {
    return (
      <Card className="p-4 space-y-3 border-primary">
        <Textarea value={draft.The_Goal} onChange={(e) => setDraft({ ...draft, The_Goal: e.target.value })} />
        <div className="flex items-center gap-2">
          <select
            className="border rounded-md px-2 py-1 text-sm bg-background"
            value={draft.Priority_Level}
            onChange={(e) => setDraft({ ...draft, Priority_Level: e.target.value as Priority })}
          >
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select
            className="border rounded-md px-2 py-1 text-sm bg-background"
            value={draft.Status}
            onChange={(e) => setDraft({ ...draft, Status: e.target.value as Objective["Status"] })}
          >
            <option value="ACTIVE">פעיל</option>
            <option value="DONE">הושלם</option>
            <option value="CANCELLED">בוטל</option>
          </select>
          <div className="flex-1" />
          <Button size="sm" onClick={() => { update(objective.Objective_ID, draft); setEditing(false); }}>שמור</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <PriorityBadge value={objective.Priority_Level} />
          <StatusPill value={objective.Status} />
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="size-7" onClick={() => setEditing(true)}>
            <Pencil className="size-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="size-7"
            onClick={() => confirm("למחוק?") && del(objective.Objective_ID)}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
      <p className="text-sm leading-relaxed">{objective.The_Goal}</p>
      <p className="text-[11px] text-muted-foreground">{objective.Objective_ID}</p>
    </Card>
  );
}
