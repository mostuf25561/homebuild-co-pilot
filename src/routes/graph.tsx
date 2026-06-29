import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeProps,
  type EdgeProps,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { AppShell } from "@/components/AppShell";
import { useStore, type Task, type RelationKind } from "@/lib/store";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Crosshair, Clock, Trash2, Pencil, RotateCcw, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { TASK_COLORS } from "@/components/TaskColorPicker";
import { TaskEditor } from "@/components/TaskEditor";

interface GraphSearch {
  focus?: string;
  lane?: boolean;
}

export const Route = createFileRoute("/graph")({
  validateSearch: (s: Record<string, unknown>): GraphSearch => ({
    focus: typeof s.focus === "string" ? s.focus : undefined,
    lane: s.lane === true || s.lane === "true",
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
  related: "#64748b",
};

const EDGE_LABEL: Record<RelationKind, string> = {
  before: "תלות",
  after: "חוסם",
  parallel: "מקביל",
  related: "קשור",
};

interface EdgeData {
  taskId: string;
  otherId: string;
  kind: RelationKind;
}

function autoLayout(
  tasks: Task[],
  positions: Record<string, { x: number; y: number }>,
  laneMode: boolean,
): { nodes: Node<Task>[]; edges: Edge<EdgeData>[] } {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: laneMode ? "LR" : "RL", nodesep: 40, ranksep: 80 });
  g.setDefaultEdgeLabel(() => ({}));
  tasks.forEach((t) => g.setNode(t.Task_ID, { width: NODE_W, height: NODE_H }));

  const edges: Edge<EdgeData>[] = [];
  tasks.forEach((t) => {
    t.relations.forEach((r) => {
      if (laneMode && r.kind !== "before" && r.kind !== "after") return;
      const [src, tgt] = r.kind === "before" ? [r.task_id, t.Task_ID] : [t.Task_ID, r.task_id];
      const id = `${t.Task_ID}|${r.task_id}|${r.kind}`;
      if (edges.some((e) => e.id === id)) return;
      g.setEdge(src, tgt);
      edges.push({
        id,
        source: src,
        target: tgt,
        type: "kindEdge",
        data: { taskId: t.Task_ID, otherId: r.task_id, kind: r.kind },
        style: {
          stroke: EDGE_COLOR[r.kind],
          strokeWidth: 2,
          strokeDasharray: r.kind === "parallel" ? "6 4" : r.kind === "related" ? "2 3" : undefined,
        },
        animated: r.kind === "before" || r.kind === "after",
      });
    });
  });

  dagre.layout(g);

  const nodes: Node<Task>[] = tasks.map((t) => {
    const dagrePos = g.node(t.Task_ID);
    const saved = positions[t.Task_ID];
    return {
      id: t.Task_ID,
      type: "task",
      position: saved
        ? saved
        : { x: dagrePos.x - NODE_W / 2, y: dagrePos.y - NODE_H / 2 },
      data: t,
    };
  });

  if (laneMode) {
    // override: order by chrono_order then by timestamp
    const ordered = [...tasks].sort((a, b) => {
      const ao = a.chrono_order ?? 9999;
      const bo = b.chrono_order ?? 9999;
      if (ao !== bo) return ao - bo;
      return new Date(a.Re_Evaluate_Timestamp).getTime() - new Date(b.Re_Evaluate_Timestamp).getTime();
    });
    ordered.forEach((t, i) => {
      const n = nodes.find((x) => x.id === t.Task_ID);
      if (n) n.position = { x: i * (NODE_W + 40), y: 0 };
    });
  }

  return { nodes, edges };
}

function TaskNode({ data, selected }: NodeProps<Task>) {
  const done = data.Status === "DONE";
  const risk = data.Status === "Flagged_Risk";
  const deleteTask = useStore((s) => s.deleteTask);
  const updateTask = useStore((s) => s.updateTask);
  const setTaskPosition = useStore((s) => s.setTaskPosition);
  void setTaskPosition;
  const [editorOpen, setEditorOpen] = useState(false);
  void editorOpen;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            "rounded-lg border-2 bg-card p-2 shadow-sm transition-all w-[240px] border-s-4",
            selected ? "border-primary ring-2 ring-primary/40" : "border-border",
            done && "opacity-60",
            risk && "border-destructive",
          )}
          style={data.color ? { borderInlineStartColor: data.color } : undefined}
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
          {data.chrono_order !== undefined && (
            <div className="absolute -top-2 -start-2 size-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
              {data.chrono_order}
            </div>
          )}
          <Handle type="source" position={Position.Right} className="!bg-primary" />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem onSelect={() => updateTask(data.Task_ID, { Status: "DONE" })}>
          סמן כבוצע
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => updateTask(data.Task_ID, { Status: "Flagged_Risk" })}>
          <Pencil className="size-3 me-2" /> סמן כסיכון
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>צבע</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onSelect={() => updateTask(data.Task_ID, { color: undefined })}>
              ללא צבע
            </ContextMenuItem>
            {TASK_COLORS.map((c) => (
              <ContextMenuItem key={c.value} onSelect={() => updateTask(data.Task_ID, { color: c.value })}>
                <span className="size-3 rounded-full me-2" style={{ backgroundColor: c.value }} />
                {c.name}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuItem
          onSelect={() => {
            const v = prompt("סדר ביצוע (מספר):", String(data.chrono_order ?? ""));
            if (v === null) return;
            updateTask(data.Task_ID, { chrono_order: v === "" ? undefined : Number(v) });
          }}
        >
          הגדר סדר ביצוע
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="text-destructive"
          onSelect={() => confirm("למחוק את המשימה?") && deleteTask(data.Task_ID)}
        >
          <Trash2 className="size-3 me-2" /> מחק
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function KindEdge(props: EdgeProps<EdgeData>) {
  const [path, labelX, labelY] = getBezierPath(props);
  const removeRelation = useStore((s) => s.removeRelation);
  const updateRelation = useStore((s) => s.updateRelation);
  const d = props.data!;
  return (
    <>
      <BaseEdge id={props.id} path={path} style={props.style} />
      <EdgeLabelRenderer>
        <div
          dir="rtl"
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
        >
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-card shadow-sm"
                style={{ color: EDGE_COLOR[d.kind] }}
              >
                {EDGE_LABEL[d.kind]}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2 text-xs space-y-1">
              <div className="font-bold mb-1">סוג קשר</div>
              {(["before", "after", "parallel", "related"] as RelationKind[]).map((k) => (
                <button
                  key={k}
                  onClick={() => updateRelation(d.taskId, d.otherId, d.kind, k)}
                  className={cn(
                    "w-full text-start px-2 py-1 rounded hover:bg-muted",
                    d.kind === k && "bg-muted font-bold",
                  )}
                  style={{ color: EDGE_COLOR[k] }}
                >
                  {EDGE_LABEL[k]}
                </button>
              ))}
              <button
                onClick={() => removeRelation(d.taskId, d.otherId, d.kind)}
                className="w-full text-start px-2 py-1 rounded hover:bg-destructive/10 text-destructive"
              >
                <Trash2 className="size-3 inline me-1" /> מחק קשר
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const NODE_TYPES = { task: TaskNode };
const EDGE_TYPES = { kindEdge: KindEdge };

function GraphPage() {
  const tasks = useStore((s) => s.tasks);
  const positions = useStore((s) => s.task_positions);
  const setTaskPosition = useStore((s) => s.setTaskPosition);
  const clearPositions = useStore((s) => s.clearTaskPositions);
  const { focus, lane } = Route.useSearch();
  const navigate = useNavigate();
  const rf = useReactFlow();

  const { nodes, edges } = useMemo(
    () => autoLayout(tasks, positions, !!lane),
    [tasks, positions, lane],
  );

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
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="border-b bg-card/60 px-4 py-2 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-bold text-lg">מפת משימות ותלויות</h1>
          <p className="text-xs text-muted-foreground">
            לחיצה ימנית על משימה לעריכה. לחיצה על תווית קשר לשינוי סוג.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={lane ? "default" : "outline"}
            onClick={() => navigate({ to: "/graph", search: { lane: !lane } })}
          >
            <Layers className="size-4" />
            {lane ? "מצב מפה" : "מסלול כרונולוגי"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => clearPositions()}>
            <RotateCcw className="size-4" /> איפוס פריסה
          </Button>
          {nextCriticalTask && (
            <Button
              size="sm"
              variant="default"
              className="gap-2"
              onClick={() => focusNode(nextCriticalTask.Task_ID)}
            >
              <Crosshair className="size-4" />
              למשימה הקריטית
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          fitView
          minZoom={0.2}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
          nodesDraggable
          onNodeDragStop={(_, n) => setTaskPosition(n.id, n.position)}
          onNodeClick={(_, n) => {
            navigate({ to: "/graph", search: { focus: n.id, lane } });
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
              style={t.color ? { borderInlineStartWidth: 3, borderInlineStartColor: t.color } : undefined}
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

      {/* dummy hidden TaskEditor portal to import-link types; real edits via context menu prompts */}
      <span className="hidden">
        <TaskEditor task={tasks[0] || ({} as Task)} />
      </span>
    </div>
  );
}
