import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED } from "./seed";
import type { PluginBundle } from "@/plugins/types";
import { findPlugin } from "@/plugins/registry";

export type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type Status = "ACTIVE" | "DONE" | "CANCELLED" | "Pending" | "In_Progress" | "Flagged_Risk" | "Delayed";
export type ThemeMode = "light" | "dark" | "blue";
export type RelationKind = "before" | "after" | "parallel" | "related";

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
  Blocked_By_Task_ID: string;
  AI_Urgency_Level: Priority;
  Snooze_Counter: number;
  Re_Evaluate_Timestamp: string;
  relations: TaskRelation[];
  color?: string;
  parent_task_id?: string;
  chrono_order?: number;
  plugin_id?: string;
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
export interface Mantra {
  id: string;
  text: string;
  tags: string[];
  created_at: string;
}
export interface DailyPlan {
  date: string; // YYYY-MM-DD
  intent: string;
  order: string[]; // task ids
}
export interface ActionHistoryEntry {
  timestamp: string;
  action: string;
  description: string;
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
  mantras: Mantra[];
  daily_plans: Record<string, DailyPlan>;
  task_positions: Record<string, { x: number; y: number }>;
  installed_plugins: string[];
  active_plugin_id: string | null;
  settings: Settings;
}

interface TransientState {
  return_stack: ReturnStackEntry[];
  action_history: ActionHistoryEntry[];
}

interface AppActions {
  updateObjective: (id: string, patch: Partial<Objective>) => void;
  addObjective: (o: Partial<Objective>) => void;
  deleteObjective: (id: string) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  addTask: (t: Partial<Task>) => Task;
  deleteTask: (id: string) => void;
  snoozeTask: (id: string, hours?: number) => void;
  addRelation: (taskId: string, rel: TaskRelation) => void;
  removeRelation: (taskId: string, otherId: string, kind: RelationKind) => void;
  updateRelation: (taskId: string, otherId: string, oldKind: RelationKind, newKind: RelationKind) => void;
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
  recordAction: (action: string, description: string) => void;
  getActionHistory: () => ActionHistoryEntry[];
  // mantras
  addMantra: (m: Partial<Mantra>) => void;
  updateMantra: (id: string, patch: Partial<Mantra>) => void;
  deleteMantra: (id: string) => void;
  // daily plans
  setDayIntent: (date: string, intent: string) => void;
  setDayOrder: (date: string, order: string[]) => void;
  // task positions
  setTaskPosition: (id: string, pos: { x: number; y: number }) => void;
  clearTaskPositions: () => void;
  // plugins
  installPlugin: (bundle: PluginBundle) => void;
  uninstallPlugin: (id: string) => void;
  setActivePlugin: (id: string | null) => void;
}

const genId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 100)}`;

function normalizeTask(t: Partial<Task>): Task {
  const relations: TaskRelation[] = Array.isArray(t.relations) ? t.relations : [];
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
    Blocked_By_Task_ID: "NONE",
    AI_Urgency_Level: t.AI_Urgency_Level || "MEDIUM",
    Snooze_Counter: t.Snooze_Counter ?? 0,
    Re_Evaluate_Timestamp: t.Re_Evaluate_Timestamp || new Date().toISOString(),
    relations,
    color: t.color,
    parent_task_id: t.parent_task_id,
    chrono_order: t.chrono_order,
    plugin_id: t.plugin_id,
  };
}

export const useStore = create<AppState & TransientState & AppActions>()(
  persist(
    (set, get) => ({
      ...SEED,
      tasks: SEED.tasks.map(normalizeTask),
      return_stack: [],
      action_history: [],
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
      addTask: (t) => {
        const task = normalizeTask(t);
        set((s) => ({ tasks: [...s.tasks, task] }));
        return task;
      },
      deleteTask: (id) =>
        set((s) => ({
          tasks: s.tasks
            .filter((t) => t.Task_ID !== id)
            .map((t) => ({
              ...t,
              relations: t.relations.filter((r) => r.task_id !== id),
              parent_task_id: t.parent_task_id === id ? undefined : t.parent_task_id,
            })),
        })),
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
      updateRelation: (taskId, otherId, oldKind, newKind) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.Task_ID === taskId
              ? {
                  ...t,
                  relations: t.relations.map((r) =>
                    r.task_id === otherId && r.kind === oldKind ? { ...r, kind: newKind } : r,
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
        set(() => ({
          ...SEED,
          tasks: SEED.tasks.map(normalizeTask),
          return_stack: [],
          action_history: [],
        })),
      exportJSON: () => {
        const s = get();
        const out: AppState = {
          objectives: s.objectives,
          tasks: s.tasks,
          decisions: s.decisions,
          advice: s.advice,
          assets: s.assets,
          chat_messages: s.chat_messages,
          mantras: s.mantras,
          daily_plans: s.daily_plans,
          task_positions: s.task_positions,
          installed_plugins: s.installed_plugins,
          active_plugin_id: s.active_plugin_id,
          settings: s.settings,
        };
        return JSON.stringify(out, null, 2);
      },
      pushReturn: (e) => set((s) => ({ return_stack: [...s.return_stack, e] })),
      popReturn: () => {
        const s = get();
        const stack = s.return_stack;
        if (stack.length === 0) return undefined;
        const top = stack[stack.length - 1];
        set({ return_stack: stack.slice(0, -1) });
        return top;
      },
      clearReturnStack: () => set({ return_stack: [] }),
      recordAction: (action, description) =>
        set((s) => ({
          action_history: [
            ...s.action_history,
            { timestamp: new Date().toISOString(), action, description },
          ].slice(-50),
        })),
      getActionHistory: () => get().action_history,
      addMantra: (m) =>
        set((s) => ({
          mantras: [
            ...s.mantras,
            {
              id: m.id || genId("MAN"),
              text: m.text || "",
              tags: m.tags || [],
              created_at: m.created_at || new Date().toISOString(),
            },
          ],
        })),
      updateMantra: (id, patch) =>
        set((s) => ({ mantras: s.mantras.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
      deleteMantra: (id) => set((s) => ({ mantras: s.mantras.filter((m) => m.id !== id) })),
      setDayIntent: (date, intent) =>
        set((s) => ({
          daily_plans: {
            ...s.daily_plans,
            [date]: { date, intent, order: s.daily_plans[date]?.order || [] },
          },
        })),
      setDayOrder: (date, order) =>
        set((s) => ({
          daily_plans: {
            ...s.daily_plans,
            [date]: { date, intent: s.daily_plans[date]?.intent || "", order },
          },
        })),
      setTaskPosition: (id, pos) =>
        set((s) => ({ task_positions: { ...s.task_positions, [id]: pos } })),
      clearTaskPositions: () => set({ task_positions: {} }),
      installPlugin: (bundle) =>
        set((s) => {
          if (s.installed_plugins.includes(bundle.id)) return s;
          // tag plugin entities + dedupe by id
          const tag = <T extends { Task_ID?: string; Objective_ID?: string; Decision_ID?: string; Advice_ID?: string }>(arr: T[]): T[] => arr;
          void tag;
          const taggedTasks = bundle.tasks
            .map((t) => normalizeTask({ ...t, plugin_id: bundle.id }))
            .filter((t) => !s.tasks.some((x) => x.Task_ID === t.Task_ID));
          const newObjs = bundle.objectives.filter(
            (o) => !s.objectives.some((x) => x.Objective_ID === o.Objective_ID),
          );
          const newDecs = bundle.decisions.filter(
            (d) => !s.decisions.some((x) => x.Decision_ID === d.Decision_ID),
          );
          const newAdv = bundle.advice.filter(
            (a) => !s.advice.some((x) => x.Advice_ID === a.Advice_ID),
          );
          return {
            installed_plugins: [...s.installed_plugins, bundle.id],
            active_plugin_id: s.active_plugin_id || bundle.id,
            objectives: [...s.objectives, ...newObjs],
            tasks: [...s.tasks, ...taggedTasks],
            decisions: [...s.decisions, ...newDecs],
            advice: [...s.advice, ...newAdv],
          };
        }),
      uninstallPlugin: (id) =>
        set((s) => ({
          installed_plugins: s.installed_plugins.filter((x) => x !== id),
          active_plugin_id: s.active_plugin_id === id ? null : s.active_plugin_id,
          tasks: s.tasks.filter((t) => t.plugin_id !== id),
        })),
      setActivePlugin: (id) => set({ active_plugin_id: id }),
    }),
    {
      name: "homebuild:v1",
      partialize: (s) => {
        const { return_stack, action_history, ...rest } = s as AppState &
          TransientState &
          AppActions;
        void return_stack;
        void action_history;
        return rest;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.settings = {
          ...{ theme: "light" as ThemeMode, ui_collapsed: {} },
          ...state.settings,
        };
        state.tasks = (state.tasks || []).map(normalizeTask);
        state.mantras = state.mantras || SEED.mantras;
        state.daily_plans = state.daily_plans || {};
        state.task_positions = state.task_positions || {};
        state.installed_plugins = state.installed_plugins || [];
        state.active_plugin_id = state.active_plugin_id ?? null;
        state.return_stack = [];
        state.action_history = [];

        // First-run / legacy migration: auto-install house-build plugin
        // so existing users keep their seed data visible.
        if (state.installed_plugins.length === 0) {
          const hasLegacyHouseData = state.tasks.some((t) => t.Task_ID?.startsWith("TSK-3"));
          if (hasLegacyHouseData) {
            // Mark legacy data as belonging to house-build plugin
            state.tasks = state.tasks.map((t) =>
              t.Task_ID?.startsWith("TSK-3") ? { ...t, plugin_id: "house-build" } : t,
            );
            state.installed_plugins = ["house-build"];
            state.active_plugin_id = "house-build";
          } else if (state.objectives.length === 0 && state.tasks.length === 0) {
            // Fresh install with no data → install house-build by default
            const hp = findPlugin("house-build");
            if (hp) {
              const taggedTasks = hp.tasks.map((t) =>
                normalizeTask({ ...t, plugin_id: hp.id }),
              );
              state.installed_plugins = [hp.id];
              state.active_plugin_id = hp.id;
              state.objectives = hp.objectives;
              state.tasks = taggedTasks;
              state.decisions = hp.decisions;
              state.advice = hp.advice;
            }
          }
        }
      },
    },
  ),
);
