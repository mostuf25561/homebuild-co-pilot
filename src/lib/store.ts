import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED } from "./seed";

export type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type Status = "ACTIVE" | "DONE" | "CANCELLED" | "Pending" | "In_Progress" | "Flagged_Risk" | "Delayed";

export interface Objective {
  Objective_ID: string;
  Category: string;
  The_Goal: string;
  Priority_Level: Priority;
  Status: Status;
}
export interface Task {
  Task_ID: string;
  Description: string;
  Status: Status;
  Blocked_By_Task_ID: string;
  AI_Urgency_Level: Priority;
  Snooze_Counter: number;
  Re_Evaluate_Timestamp: string;
}
export interface Decision {
  Decision_ID: string;
  Topic: string;
  Final_Choice_Made: string;
  Rationale_Short_vs_Long_Term: string;
  Linked_Advice_ID: string;
}
export interface Advice {
  Advice_ID: string;
  Source_Name: string;
  Advice_Content: string;
  Contractor_Claim_Verification_Status: string;
}
export interface Asset {
  Asset_ID: string;
  Google_Drive_Photo_URL: string;
  Structural_Tag: string;
  Linked_Task_ID: string;
}
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}
export interface Settings {
  openrouter_api_key: string;
  model_route: string;
  system_prompt: string;
}

export interface AppState {
  objectives: Objective[];
  tasks: Task[];
  decisions: Decision[];
  advice: Advice[];
  assets: Asset[];
  chat_messages: ChatMessage[];
  settings: Settings;
}

interface AppActions {
  updateObjective: (id: string, patch: Partial<Objective>) => void;
  addObjective: (o: Partial<Objective>) => void;
  deleteObjective: (id: string) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  addTask: (t: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  snoozeTask: (id: string, hours?: number) => void;
  addDecision: (d: Partial<Decision>) => void;
  updateDecision: (id: string, patch: Partial<Decision>) => void;
  deleteDecision: (id: string) => void;
  addChatMessage: (m: ChatMessage) => void;
  setSettings: (patch: Partial<Settings>) => void;
  hydrate: (state: Partial<AppState>) => void;
  resetToSeed: () => void;
  exportJSON: () => string;
}

const genId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 100)}`;

export const useStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      ...SEED,
      updateObjective: (id, patch) =>
        set((s) => ({
          objectives: s.objectives.map((o) => (o.Objective_ID === id ? { ...o, ...patch } : o)),
        })),
      addObjective: (o) =>
        set((s) => ({
          objectives: [
            ...s.objectives,
            {
              Objective_ID: o.Objective_ID || genId("OBJ"),
              Category: o.Category || "כללי",
              The_Goal: o.The_Goal || "",
              Priority_Level: o.Priority_Level || "MEDIUM",
              Status: o.Status || "ACTIVE",
            },
          ],
        })),
      deleteObjective: (id) =>
        set((s) => ({ objectives: s.objectives.filter((o) => o.Objective_ID !== id) })),
      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.Task_ID === id ? { ...t, ...patch } : t)),
        })),
      addTask: (t) =>
        set((s) => ({
          tasks: [
            ...s.tasks,
            {
              Task_ID: t.Task_ID || genId("TSK"),
              Description: t.Description || "",
              Status: t.Status || "Pending",
              Blocked_By_Task_ID: t.Blocked_By_Task_ID || "NONE",
              AI_Urgency_Level: t.AI_Urgency_Level || "MEDIUM",
              Snooze_Counter: t.Snooze_Counter ?? 0,
              Re_Evaluate_Timestamp: t.Re_Evaluate_Timestamp || new Date().toISOString(),
            },
          ],
        })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.Task_ID !== id) })),
      snoozeTask: (id, hours = 24) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.Task_ID === id
              ? {
                  ...t,
                  Snooze_Counter: t.Snooze_Counter + 1,
                  Re_Evaluate_Timestamp: new Date(Date.now() + hours * 3600_000).toISOString(),
                }
              : t,
          ),
        })),
      addDecision: (d) =>
        set((s) => ({
          decisions: [
            ...s.decisions,
            {
              Decision_ID: d.Decision_ID || genId("DEC"),
              Topic: d.Topic || "",
              Final_Choice_Made: d.Final_Choice_Made || "",
              Rationale_Short_vs_Long_Term: d.Rationale_Short_vs_Long_Term || "",
              Linked_Advice_ID: d.Linked_Advice_ID || "NONE",
            },
          ],
        })),
      updateDecision: (id, patch) =>
        set((s) => ({
          decisions: s.decisions.map((d) => (d.Decision_ID === id ? { ...d, ...patch } : d)),
        })),
      deleteDecision: (id) =>
        set((s) => ({ decisions: s.decisions.filter((d) => d.Decision_ID !== id) })),
      addChatMessage: (m) => set((s) => ({ chat_messages: [...s.chat_messages, m] })),
      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      hydrate: (state) => set((s) => ({ ...s, ...state })),
      resetToSeed: () => set(() => ({ ...SEED })),
      exportJSON: () => {
        const s = get();
        const { ...rest } = s;
        const out: AppState = {
          objectives: rest.objectives,
          tasks: rest.tasks,
          decisions: rest.decisions,
          advice: rest.advice,
          assets: rest.assets,
          chat_messages: rest.chat_messages,
          settings: rest.settings,
        };
        return JSON.stringify(out, null, 2);
      },
    }),
    {
      name: "homebuild:v1",
      // Only run on client
      skipHydration: false,
    },
  ),
);
