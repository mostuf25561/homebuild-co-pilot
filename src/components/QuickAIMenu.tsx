import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Sparkles, ChevronDown } from "lucide-react";
import { callOpenRouter, extractActions, applyActions } from "@/lib/openrouter";

export function QuickAIMenu() {
  const addMessage = useStore((s) => s.addChatMessage);
  const apiKey = useStore((s) => s.settings.openrouter_api_key);
  const tasks = useStore((s) => s.tasks);
  const recordAction = useStore((s) => s.recordAction);
  const [loading, setLoading] = useState(false);

  const quickActions = [
    {
      label: "סיכום מצב הפרויקט",
      prompt:
        "בהתבסס על המשימות והקביעות הנוכחיות, תן לי סיכום קצר של מצב הפרויקט. מה עובר טוב? מה צריך תשומת לב?",
    },
    {
      label: "זהה בעיות פוטנציאליות",
      prompt:
        "בדוק את המשימות הקיימות וזהה בעיות פוטנציאליות, תלויות שאינן מסודרות, או סיכונים שיכולים להשפיע על הפרויקט.",
    },
    {
      label: "הצע משימות",
      prompt:
        "בהתבסס על מצב הפרויקט הנוכחי, הצע 2-3 משימות חדשות שצריך לטפל בהן בשלב זה.",
    },
    {
      label: "ניתוח עדיפויות",
      prompt:
        "בחן את המשימות הקיימות והצע סדר עדיפויות חדש. פרט את ההיגיון שלך.",
    },
  ];

  const runQuickAction = async (prompt: string, label: string) => {
    if (!apiKey || loading) return;
    setLoading(true);
    try {
      const userMsg = {
        id: crypto.randomUUID(),
        role: "user" as const,
        content: prompt,
        timestamp: new Date().toISOString(),
      };
      addMessage(userMsg);
      recordAction("quick_ai_action", label);

      const reply = await callOpenRouter(prompt, []);
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
      const err = e instanceof Error ? e.message : "שגיאה לא ידועה";
      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: `שגיאה: ${err}`,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  if (!apiKey) return null;

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-amber-500" />
          <span className="text-sm font-medium">פעולות AI מהירות</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              disabled={loading}
            >
              בחר פעולה
              <ChevronDown className="size-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {quickActions.map((action, i) => (
              <DropdownMenuItem
                key={i}
                onClick={() => runQuickAction(action.prompt, action.label)}
                disabled={loading}
                className="text-xs"
              >
                {action.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
              משימות פעילות: {tasks.filter((t) => t.Status !== "DONE" && t.Status !== "CANCELLED").length}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
