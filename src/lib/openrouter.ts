import { z } from "zod";
import type { AppState } from "./store";
import { useStore } from "./store";

const ActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("add_task"),
    description: z.string(),
    urgency: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
    blocked_by: z.string().optional(),
  }),
  z.object({
    type: z.literal("update_task"),
    task_id: z.string(),
    patch: z.record(z.string(), z.any()),
  }),
  z.object({
    type: z.literal("flag_task"),
    task_id: z.string(),
  }),
  z.object({
    type: z.literal("snooze_task"),
    task_id: z.string(),
    hours: z.number().optional(),
  }),
  z.object({
    type: z.literal("add_decision"),
    topic: z.string(),
    final_choice: z.string(),
    rationale: z.string(),
  }),
  z.object({
    type: z.literal("add_objective"),
    category: z.string(),
    goal: z.string(),
    priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
  }),
]);
export type Action = z.infer<typeof ActionSchema>;

export function buildSystemPrompt(state: AppState): string {
  const snapshot = {
    objectives: state.objectives,
    tasks: state.tasks,
    decisions: state.decisions,
    advice: state.advice,
  };
  return `${state.settings.system_prompt}

You MUST reply in Hebrew. After your natural-language reply, if any state change is needed, append a single fenced JSON code block exactly like:
\`\`\`json
{"actions":[{"type":"add_task","description":"..."}]}
\`\`\`
Supported action types: add_task, update_task, flag_task, snooze_task, add_decision, add_objective.
If no action is needed, omit the JSON block.

Current state snapshot:
${JSON.stringify(snapshot)}`;
}

export function extractActions(text: string): { cleanText: string; actions: Action[] } {
  const re = /```json\s*([\s\S]*?)```/g;
  let match;
  const actions: Action[] = [];
  let cleanText = text;
  while ((match = re.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed?.actions)) {
        for (const a of parsed.actions) {
          const r = ActionSchema.safeParse(a);
          if (r.success) actions.push(r.data);
        }
      }
      cleanText = cleanText.replace(match[0], "").trim();
    } catch {
      /* ignore */
    }
  }
  return { cleanText, actions };
}

export function applyActions(actions: Action[]): string[] {
  const s = useStore.getState();
  const log: string[] = [];
  for (const a of actions) {
    switch (a.type) {
      case "add_task":
        s.addTask({
          Description: a.description,
          AI_Urgency_Level: a.urgency || "MEDIUM",
          Blocked_By_Task_ID: a.blocked_by || "NONE",
        });
        log.push(`נוספה משימה: ${a.description}`);
        break;
      case "update_task":
        s.updateTask(a.task_id, a.patch as never);
        log.push(`עודכנה משימה ${a.task_id}`);
        break;
      case "flag_task":
        s.updateTask(a.task_id, { Status: "Flagged_Risk" });
        log.push(`סומנה כסיכון: ${a.task_id}`);
        break;
      case "snooze_task":
        s.snoozeTask(a.task_id, a.hours);
        log.push(`נדחתה משימה ${a.task_id}`);
        break;
      case "add_decision":
        s.addDecision({
          Topic: a.topic,
          Final_Choice_Made: a.final_choice,
          Rationale_Short_vs_Long_Term: a.rationale,
        });
        log.push(`נוספה החלטה: ${a.topic}`);
        break;
      case "add_objective":
        s.addObjective({
          Category: a.category,
          The_Goal: a.goal,
          Priority_Level: a.priority || "MEDIUM",
        });
        log.push(`נוספה מטרה: ${a.goal}`);
        break;
    }
  }
  return log;
}

export async function callOpenRouter(
  userMessage: string,
  history: { role: string; content: string }[],
): Promise<string> {
  const { settings } = useStore.getState();
  if (!settings.openrouter_api_key) {
    throw new Error("חסר מפתח API. הגדר אותו בעמוד ההגדרות.");
  }
  const state = useStore.getState();
  const messages = [
    { role: "system", content: buildSystemPrompt(state) },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.openrouter_api_key}`,
      "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
      "X-Title": "HomeBuild Co-Pilot",
    },
    body: JSON.stringify({
      model: settings.model_route,
      messages,
    }),
  });

  if (!res.ok) {
    const errTxt = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${errTxt.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}
