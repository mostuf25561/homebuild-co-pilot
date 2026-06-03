import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useCallback, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeProps,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { AppShell } from "@/components/AppShell";
import { useStore, type Task, type RelationKind } from "@/lib/store";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Crosshair, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface GraphSearch {
  focus?: string;
}

export const Route = createFileRoute("/graph")({
  validateSearch: (s: Record<string, unknown>): GraphSearch => ({
    focus: typeof s.focus === "string" ? s.focus : undefined,
  }),
  component: () => (
    <AppShell>
      <ReactFlowProvider>
        <GraphPage />
      </ReactFlowProvider>
    </AppShell>
  ),
});

const NODE_W = 240;
const NODE_H = 92;

const EDGE_COLOR: Record<RelationKind, string> = {
  before: "#f59e0b",
  after: "#0ea5e9",
  parallel: "#8b5cf6",
};

function layout(tasks: Task[]): { nodes: Node<Task>[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "RL", nodesep: 40, ranksep: 80 });
  g.setDefaultEdgeLabel(() => ({}));

  tasks.forEach((t) => g.setNode(t.Task_ID, { width: NODE_W, height: NODE_H }));

  const edges: Edge[] = [];
  tasks.forEach((t) => {
    t.relations.forEach((r) => {
      // before: t depends on r (r → t)
      // after: r depends on t (t → r)
      const [src, tgt] =
        r.kind === "before" ? [r.task_id, t.Task_ID] : [t.Task_ID, r.task_id];
      const id = `${src}-${tgt}-${r.kind}`;
      if (edges.some((e) => e.id === id)) return;
      g.setEdge(src, tgt);
      edges.push({
        id,
        source: src,
        target: tgt,
        animated: r.kind !== "parallel",
        style: { stroke: EDGE_COLOR[r.kind], strokeWidth: 2, strokeDasharray: r.kind === "parallel" ? "6 4" : undefined },
        label: r.kind === "before" ? "תלות" : r.kind === "after" ? "חוסם" : "מקביל",
        labelStyle: { fill: EDGE_COLOR[r.kind], fontSize: 10, fontWeight: 700 },
        labelBgStyle: { fill: "var(--card)" },
      });
    });
  });

  dagre.layout(g);

  const nodes: Node<Task>[] = tasks.map((t) => {
    const pos = g.node(t.Task_ID);
    return {
      id: t.Task_ID,
      type: "task",
      position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 },
      data: t,
    };
  });

  return { nodes, edges };
}

function TaskNode({ data, selected }: NodeProps<Task>) {
  const done = data.Status === "DONE";
  const risk = data.Status === "Flagged_Risk";
  return (
    <div
      className={cn(
        "rounded-lg border-2 bg-card p-2 shadow-sm transition-all w-[240px]",
        selected ? "border-primary ring-2 ring-primary/40" : "border-border",
        done && "opacity-60",
        risk && "border-destructive",
      )}
      dir="rtl"
    >
      <Handle type="target" position={Position.Left} className="!bg-primary" />
      <div className="flex items-start justify-between gap-1 mb-1">
        <PriorityBadge value={data.AI_Urgency_Level} />
        <span className="text-[10px] text-muted-foreground">
          {new Date(data.Re_Evaluate_Timestamp).toLocaleDateString("he-IL")}
        </span>
      </div>
      <p className="text-xs leading-snug line-clamp-3 font-medium">{data.Description}</p>
      <Handle type="source" position={Position.Right} className="!bg-primary" />
    </div>
  );
}

const NODE_TYPES = { task: TaskNode };

function GraphPage() {
  const tasks = useStore((s) => s.tasks);
  const { focus } = Route.useSearch();
  const navigate = useNavigate();
  const rf = useReactFlow();

  const { nodes, edges } = useMemo(() => layout(tasks), [tasks]);

  // Sort tasks chronologically among non-done as a "critical path" of sorts
  const timeline = useMemo(
    () =>
      [...tasks]
        .filter((t) => t.Status !== "DONE" && t.Status !== "CANCELLED")
        .sort(
          (a, b) =>
            new Date(a.Re_Evaluate_Timestamp).getTime() -
            new Date(b.Re_Evaluate_Timestamp).getTime(),
        ),
    [tasks],
  );

  const PRIORITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 } as const;
  const nextCriticalTask = useMemo(() => {
    return (
      [...timeline].sort(
        (a, b) =>
          PRIORITY_ORDER[a.AI_Urgency_Level] - PRIORITY_ORDER[b.AI_Urgency_Level],
      )[0] || null
    );
  }, [timeline]);

  const focusNode = useCallback(
    (id: string) => {
      const node = rf.getNode(id);
      if (!node) return;
      rf.setCenter(node.position.x + NODE_W / 2, node.position.y + NODE_H / 2, {
        zoom: 1.2,
        duration: 600,
      });
    },
    [rf],
  );

  useEffect(() => {
    if (focus) {
      const t = setTimeout(() => focusNode(focus), 200);
      return () => clearTimeout(t);
    }
  }, [focus, focusNode]);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-[calc(100vh-3.5rem)]">
      <div className="border-b bg-card/60 px-4 py-2 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-bold text-lg">מפת משימות ותלויות</h1>
          <p className="text-xs text-muted-foreground">
            צבע קו: כתום=תלות, תכלת=חוסם, סגול=מקביל
          </p>
        </div>
        {nextCriticalTask && (
          <Button
            size="sm"
            variant="default"
            className="gap-2"
            onClick={() => focusNode(nextCriticalTask.Task_ID)}
          >
            <Crosshair className="size-4" />
            קפוץ למשימה הקריטית הבאה
          </Button>
        )}
      </div>

      <div className="flex-1 min-h-0 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          fitView
          minZoom={0.2}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
          nodesDraggable
          onNodeClick={(_, n) => {
            navigate({ to: "/graph", search: { focus: n.id } });
          }}
        >
          <Background gap={20} size={1} />
          <MiniMap pannable zoomable className="!bg-card !border" />
          <Controls position="bottom-right" />
        </ReactFlow>
      </div>

      <Card className="rounded-none border-t p-2 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <Clock className="size-4 text-muted-foreground shrink-0" />
          {timeline.length === 0 && (
            <span className="text-xs text-muted-foreground">אין משימות פעילות</span>
          )}
          {timeline.map((t) => (
            <button
              key={t.Task_ID}
              onClick={() => focusNode(t.Task_ID)}
              className={cn(
                "shrink-0 rounded-md border px-2 py-1 text-xs hover:bg-muted text-start max-w-[200px]",
                t.AI_Urgency_Level === "CRITICAL" && "border-critical text-critical",
              )}
              title={t.Description}
            >
              <div className="font-bold truncate">{t.Description.slice(0, 28)}</div>
              <div className="text-[10px] text-muted-foreground">
                {new Date(t.Re_Evaluate_Timestamp).toLocaleString("he-IL", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
