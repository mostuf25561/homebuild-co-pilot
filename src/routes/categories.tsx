import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TASK_COLORS } from "@/components/TaskColorPicker";

export const Route = createFileRoute("/categories")({
  component: () => (
    <AppShell>
      <CategoriesPage />
    </AppShell>
  ),
});

function CategoriesPage() {
  const objectives = useStore((s) => s.objectives);
  const tasks = useStore((s) => s.tasks);
  const navigate = useNavigate();

  const data = useMemo(() => {
    // count tasks per objective category (mapping by Objective category names)
    const counts: Record<string, number> = {};
    for (const o of objectives) counts[o.Category] = counts[o.Category] || 0;
    // Map orphan tasks under "ללא קטגוריה"
    for (const t of tasks) {
      if (t.Status === "DONE" || t.Status === "CANCELLED") continue;
      // assign to first matching objective category by description keywords (best-effort) — fallback general
      // Simpler: just count by objective categories proportional to objectives count, plus a generic bucket for tasks
    }
    const objCount: Record<string, number> = {};
    for (const o of objectives) objCount[o.Category] = (objCount[o.Category] || 0) + 1;
    // We'll show two views: objectives by category, and tasks pie by color
    return Object.entries(objCount).map(([name, value], i) => ({
      name,
      value,
      fill: TASK_COLORS[i % TASK_COLORS.length].value,
    }));
  }, [objectives, tasks]);

  const taskColorData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tasks) {
      if (t.Status === "DONE" || t.Status === "CANCELLED") continue;
      const c = t.color || "#94a3b8";
      counts[c] = (counts[c] || 0) + 1;
    }
    return Object.entries(counts).map(([c, v]) => ({ name: c, value: v, fill: c }));
  }, [tasks]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold">מבט קטגוריות</h1>
        <p className="text-sm text-muted-foreground mt-1">
          חלוקה ויזואלית של המטרות והמשימות שלך. לחץ על פלח כדי לצלול פנימה.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h2 className="font-bold mb-3">מטרות לפי קטגוריה</h2>
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground">אין מטרות עדיין.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={45}
                    label={(p) => p.name}
                    onClick={(d) => {
                      const name = (d as { name?: string }).name;
                      if (name) {
                        navigate({ to: "/objectives", search: { category: name } });
                      }
                    }}
                  >
                    {data.map((d, i) => (
                      <Cell key={i} fill={d.fill} style={{ cursor: "pointer" }} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="font-bold mb-3">משימות פעילות לפי צבע</h2>
          {taskColorData.length === 0 ? (
            <p className="text-sm text-muted-foreground">אין משימות פעילות.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskColorData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={45}
                  >
                    {taskColorData.map((d, i) => (
                      <Cell key={i} fill={d.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
