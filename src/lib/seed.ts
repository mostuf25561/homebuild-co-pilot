import type { AppState } from "./store";

export const SEED: AppState = {
  objectives: [],
  tasks: [],
  decisions: [],
  advice: [],
  assets: [],
  chat_messages: [],
  mantras: [
    {
      id: "mantra-default-1",
      text: "אני אורח בעולם הזה. אני עושה את שלי, ושאר הדברים יסתדרו.",
      tags: ["שקט", "פרספקטיבה"],
      created_at: new Date().toISOString(),
    },
    {
      id: "mantra-default-2",
      text: "צעד אחד קטן עכשיו שווה יותר מתוכנית מושלמת מחר.",
      tags: ["מיקוד"],
      created_at: new Date().toISOString(),
    },
    {
      id: "mantra-default-3",
      text: "הכל לא חייב להיעשות היום. רק הדבר הבא.",
      tags: ["שקט", "ADHD"],
      created_at: new Date().toISOString(),
    },
  ],
  daily_plans: {},
  task_positions: {},
  installed_plugins: [],
  active_plugin_id: null,
  settings: {
    openrouter_api_key: "",
    model_route: "openrouter/auto:free",
    theme: "light",
    ui_collapsed: {},
    system_prompt:
      "You are 'Goal Co-Pilot', a calm, ADHD-friendly supervisor for owner-driven personal projects. Default language for interaction is Hebrew (RTL). Help the user break overwhelming goals into small, ordered next-actions. Use structured Yes/No/Delay choices for critical-path items. Rely on State changes rather than long conversations.",
  },
};
