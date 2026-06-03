import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED } from "./seed";

export type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type Status = "ACTIVE" | "DONE" | "CANCELLED" | "Pending" | "In_Progress" | "Flagged_Risk" | "Delayed";
export type ThemeMode = "light" | "dark" | "blue";
export type RelationKind = "before" | "after" | "parallel";

export interface TaskRelation {
  kind: RelationKind;
  task_id: string;
}

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
  Blocked_By_Task_ID: string; // legacy, kept for backwards compat
  AI_Urgency_Level: Priority;
  Snooze_Counter: number;
  Re_Evaluate_Timestamp: string;
  relations: TaskRelation[];
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
  theme: ThemeMode;
  ui_collapsed: Record<string, boolean>;
}

export interface ReturnStackEntry {
  route: string;
  task_id?: string;
  label: string;
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

interface TransientState {
  return_stack: ReturnStackEntry[];
}

interface AppActions {
  updateObjective: (id: string, patch: Partial<Objective>) => void;
  addObjective: (o: Partial<Objective>) => void;
  deleteObjective: (id: string) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  addTask: (t: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  snoozeTask: (id: string, hours?: number) => void;
  addRelation: (taskId: string, rel: TaskRelation) => void;
  removeRelation: (taskId: string, otherId: string, kind: RelationKind) => void;
  addDecision: (d: Partial<Decision>) => void;
  updateDecision: (id: string, patch: Partial<Decision>) => void;
  deleteDecision: (id: string) => void;
  addChatMessage: (m: ChatMessage) => void;
  setSettings: (patch: Partial<Settings>) => void;
  toggleCollapsed: (key: string) => void;
  hydrate: (state: Partial<AppState>) => void;
  resetToSeed: () => void;
  exportJSON: () => string;
  pushReturn: (e: ReturnStackEntry) => void;
  popReturn: () => ReturnStackEntry | undefined;
  clearReturnStack: () => void;
}

const genId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 100)}`;

function normalizeTask(t: Partial<Task>): Task {
  const relations: TaskRelation[] = Array.isArray(t.relations) ? t.relations : [];
  // migrate legacy blocked_by → "before" relation
  if (t.Blocked_By_Task_ID && t.Blocked_By_Task_ID !== "NONE") {
    const exists = relations.some(
      (r) => r.kind === "before" && r.task_id === t.Blocked_By_Task_ID,
    );
    if (!exists) relations.push({ kind: "before", task_id: t.Blocked_By_Task_ID });
  }
  return {
    Task_ID: t.Task_ID || genId("TSK"),
    Description: t.Description || "",
    Status: t.Status || "Pending",
    Blocked_By_Task_ID: t.Blocked_By_Task_ID || "NONE",
    AI_Urgency_Level: t.AI_Urgency_Level || "MEDIUM",
    Snooze_Counter: t.Snooze_Counter ?? 0,
    Re_Evaluate_Timestamp: t.Re_Evaluate_Timestamp || new Date().toISOString(),
    relations,
  };
}

export const useStore = create<AppState & TransientState & AppActions>()(
  persist(
    (set, get) => ({
      ...SEED,
      tasks: SEED.tasks.map(normalizeTask),
      return_stack: [],
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
      addTask: (t) => set((s) => ({ tasks: [...s.tasks, normalizeTask(t)] })),
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
      addRelation: (taskId, rel) =>
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.Task_ID !== taskId) return t;
            const exists = t.relations.some(
              (r) => r.kind === rel.kind && r.task_id === rel.task_id,
            );
            if (exists) return t;
            return { ...t, relations: [...t.relations, rel] };
          }),
        })),
      removeRelation: (taskId, otherId, kind) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.Task_ID === taskId
              ? {
                  ...t,
                  relations: t.relations.filter(
                    (r) => !(r.task_id === otherId && r.kind === kind),
                  ),
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
      toggleCollapsed: (key) =>
        set((s) => ({
          settings: {
            ...s.settings,
            ui_collapsed: { ...s.settings.ui_collapsed, [key]: !s.settings.ui_collapsed[key] },
          },
        })),
      hydrate: (state) =>
        set((s) => ({
          ...s,
          ...state,
          tasks: (state.tasks || s.tasks).map(normalizeTask),
        })),
      resetToSeed: () =>
        set(() => ({ ...SEED, tasks: SEED.tasks.map(normalizeTask), return_stack: [] })),
      exportJSON: () => {
        const s = get();
        const out: AppState = {
          objectives: s.objectives,
          tasks: s.tasks,
          decisions: s.decisions,
          advice: s.advice,
          assets: s.assets,
          chat_messages: s.chat_messages,
          settings: s.settings,
        };
        return JSON.stringify(out, null, 2);
      },
      pushReturn: (e) => set((s) => ({ return_stack: [...s.return_stack, e] })),
      popReturn: () => {
        const stack = get().return_stack;
        if (stack.length === 0) return undefined;
        const top = stack[stack.length - 1];
        set({ return_stack: stack.slice(0, -1) });
        return top;
      },
      clearReturnStack: () => set({ return_stack: [] }),
    }),
    {
      name: "homebuild:v1",
      // Don't persist the return stack (UI session-only)
      partialize: (s) => {
        const { return_stack, ...rest } = s as AppState & TransientState & AppActions;
        void return_stack;
        return rest;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.settings = {
          ...{ theme: "light" as ThemeMode, ui_collapsed: {} },
          ...state.settings,
        };
        state.tasks = state.tasks.map(normalizeTask);
        state.return_stack = [];
      },
    },
  ),
);
