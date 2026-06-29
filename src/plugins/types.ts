import type { Objective, Task, Decision, Advice } from "@/lib/store";

export interface PluginBundle {
  id: string;
  name_he: string;
  name_en: string;
  description: string;
  icon: string; // lucide icon name
  ai_prompt_addendum: string;
  color_palette?: string[];
  objectives: Objective[];
  tasks: Task[];
  decisions: Decision[];
  advice: Advice[];
}

/** Strip runtime/progress fields so only the blueprint travels. */
export function stripRuntime(bundle: PluginBundle): PluginBundle {
  return {
    ...bundle,
    objectives: bundle.objectives.map((o) => ({ ...o, Status: "ACTIVE" })),
    tasks: bundle.tasks.map((t) => ({
      ...t,
      Status: "Pending",
      Snooze_Counter: 0,
      Re_Evaluate_Timestamp: new Date().toISOString(),
    })),
  };
}
