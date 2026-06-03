import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useStore, type Task } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatusPill } from "@/components/StatusPill";
import { AppShell } from "@/components/AppShell";
import { TaskRelationsEditor } from "@/components/TaskRelationsEditor";
import { TaskEditor } from "@/components/TaskEditor";
import { QuickAIMenu } from "@/components/QuickAIMenu";
import { callOpenRouter, extractActions, applyActions } from "@/lib/openrouter";
import { TriangleAlert as AlertTriangle, Send, Check, X, Clock, Flag, Loader as Loader2, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/copilot")({
  component: () => (
    <AppShell>
      <CopilotPage />
    </AppShell>
  ),
});

function CopilotPage() {
  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-4 p-4 min-h-full">
      <div className="space-y-4">
        <QuickAIMenu />
        <ChatPanel />
      </div>
      <AlertsRail />
    </div>
  );
}

function AlertsRail() {
  const tasks = useStore((s) => s.tasks);
  const updateTask = useStore((s) => s.updateTask);
  const snoozeTask = useStore((s) => s.snoozeTask);
  const collapsedMap = useStore((s) => s.settings.ui_collapsed);
  const toggleCollapsed = useStore((s) => s.toggleCollapsed);
  const railCollapsed = !!collapsedMap["alerts_rail"];

  const now = Date.now();
  const sorted = [...tasks]
    .filter((t) => t.Status !== "DONE" && t.Status !== "CANCELLED")
    .sort((a, b) => {
      const order: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      const pa = (order[a.AI_Urgency_Level] ?? 999) - (order[b.AI_Urgency_Level] ?? 999);
      if (pa !== 0) return pa;
      return new Date(a.Re_Evaluate_Timestamp).getTime() - new Date(b.Re_Evaluate_Timestamp).getTime();
    });

  return (
    <aside className="space-y-3 lg:max-h-[calc(100vh-7rem)] lg:overflow-auto lg:sticky lg:top-20">
      <Collapsible open={!railCollapsed} onOpenChange={() => toggleCollapsed("alerts_rail")}>
        <div className="flex items-center justify-between gap-2 font-bold text-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-critical" />
            התראות פעילות
            <span className="text-xs font-normal text-muted-foreground">({sorted.length})</span>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ChevronDown
                className={cn("transition-transform", railCollapsed && "-rotate-90")}
              />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-3 pt-3">
          {sorted.length === 0 && (
            <p className="text-sm text-muted-foreground">אין התראות פעילות.</p>
          )}
          {sorted.map((t) => {
            const overdue = new Date(t.Re_Evaluate_Timestamp).getTime() < now;
            const key = `task_${t.Task_ID}`;
            const taskCollapsed = !!collapsedMap[key];
            return (
              <Card
                key={t.Task_ID}
                id={`task-${t.Task_ID}`}
                className={cn("p-3 space-y-2", overdue && "ring-1 ring-critical")}
              >
                <div className="flex items-start justify-between gap-2">
                  <PriorityBadge value={t.AI_Urgency_Level} />
                  <div className="flex items-center gap-1">
                    <StatusPill value={t.Status} />
                    <button
                      onClick={() => toggleCollapsed(key)}
                      className="text-muted-foreground hover:text-foreground"
                      title={taskCollapsed ? "הרחב" : "צמצם"}
                    >
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform",
                          taskCollapsed && "-rotate-90",
                        )}
                      />
                    </button>
                  </div>
                </div>
                <p className="text-sm leading-relaxed font-medium">{t.Description}</p>
                {!taskCollapsed && (
                  <>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                      <Clock className="size-3" />
                      {new Date(t.Re_Evaluate_Timestamp).toLocaleString("he-IL")}
                      {t.Snooze_Counter > 0 && <span>· נדחה {t.Snooze_Counter}×</span>}
                    </div>
                    <TaskRelationsEditor task={t} />
                    <div className="flex gap-1.5 pt-1">
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 h-7 text-xs"
                        onClick={() => updateTask(t.Task_ID, { Status: "DONE" })}
                      >
                        <Check /> בוצע
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-xs"
                        onClick={() => updateTask(t.Task_ID, { Status: "CANCELLED" })}
                      >
                        <X /> לא רלוונטי
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs px-2"
                        onClick={() => snoozeTask(t.Task_ID, 24)}
                      >
                        <Clock /> דחה
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs px-2"
                        onClick={() => updateTask(t.Task_ID, { Status: "Flagged_Risk" })}
                      >
                        <Flag />
                      </Button>
                      <TaskEditor task={t} />
                    </div>
                  </>
                )}
              </Card>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    </aside>
  );
}

function ChatPanel() {
  const messages = useStore((s) => s.chat_messages);
  const addMessage = useStore((s) => s.addChatMessage);
  const apiKey = useStore((s) => s.settings.openrouter_api_key);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setError(null);
    setLoading(true);
    const userMsg = { id: crypto.randomUUID(), role: "user" as const, content: text, timestamp: new Date().toISOString() };
    addMessage(userMsg);
    setInput("");
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const reply = await callOpenRouter(text, history);
      const { cleanText, actions } = extractActions(reply);
      const appliedLog = applyActions(actions);
      const finalContent =
        cleanText + (appliedLog.length ? `\n\n**שינויים שבוצעו:**\n- ${appliedLog.join("\n- ")}` : "");
      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: finalContent || reply,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "שגיאה לא ידועה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-7rem)] overflow-hidden">
      <div className="p-3 border-b flex items-center justify-between">
        <h2 className="font-bold">צ'אט פיקוח AI</h2>
        {!apiKey && (
          <Link to="/settings" className="text-xs text-destructive underline">
            ⚠ הגדר מפתח API
          </Link>
        )}
      </div>
      <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm pt-10">
            <p className="font-medium mb-2">שלום! אני ה-Co-Pilot שלך לפרויקט הבנייה.</p>
            <p>ספר לי על מצב הפרויקט, או בקש ממני להוסיף משימות והחלטות.</p>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              m.role === "user"
                ? "bg-primary text-primary-foreground ms-auto"
                : "bg-muted me-auto",
            )}
          >
            <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1">
              <ReactMarkdown>{m.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="bg-muted rounded-2xl px-4 py-2.5 me-auto inline-flex items-center gap-2 text-sm">
            <Loader2 className="size-4 animate-spin" /> חושב...
          </div>
        )}
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 border border-destructive/30">
            {error}
          </div>
        )}
      </div>
      <div className="border-t p-3 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="כתוב הודעה... (Enter לשליחה)"
          className="resize-none min-h-[44px] max-h-32"
          rows={1}
        />
        <Button onClick={send} disabled={loading || !input.trim()}>
          <Send />
        </Button>
      </div>
    </Card>
  );
}

// Helper so the file uses Task type (avoid unused warning)
export type _T = Task;
