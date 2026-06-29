import type { PluginBundle } from "./types";

export const guitarPlugin: PluginBundle = {
  id: "guitar-progress",
  name_he: "התקדמות בגיטרה",
  name_en: "Guitar Progress",
  description: "מסלול אימון מובנה לגיטרה: טכניקה, רפרטואר, תיאוריה.",
  icon: "Music",
  ai_prompt_addendum:
    "ההקשר: המשתמש מתאמן בגיטרה לבד. הצע אימונים קצרים יומיים (15-25 דק'), מאזן בין טכניקה, האזנה ושירים. סמן ניצחונות קטנים.",
  color_palette: ["#8b5cf6", "#ec4899", "#14b8a6"],
  objectives: [
    {
      Objective_ID: "OBJ-G01",
      Category: "טכניקה",
      The_Goal: "להגיע ל-120 BPM בתרגיל פיקינג מתחלף נקי",
      Priority_Level: "HIGH",
      Status: "ACTIVE",
    },
    {
      Objective_ID: "OBJ-G02",
      Category: "רפרטואר",
      The_Goal: "ללמוד 3 שירים מלאים לסט פתיחה",
      Priority_Level: "MEDIUM",
      Status: "ACTIVE",
    },
  ],
  tasks: [
    {
      Task_ID: "TSK-G01",
      Description: "אימון פיקינג 15 דק' עם מטרונום",
      Status: "Pending",
      Blocked_By_Task_ID: "NONE",
      AI_Urgency_Level: "HIGH",
      Snooze_Counter: 0,
      Re_Evaluate_Timestamp: new Date(Date.now() + 86400000).toISOString(),
      relations: [],
      color: "#8b5cf6",
    },
    {
      Task_ID: "TSK-G02",
      Description: "ללמוד את הבית הראשון של שיר מס' 1",
      Status: "Pending",
      Blocked_By_Task_ID: "NONE",
      AI_Urgency_Level: "MEDIUM",
      Snooze_Counter: 0,
      Re_Evaluate_Timestamp: new Date(Date.now() + 86400000 * 2).toISOString(),
      relations: [],
      color: "#ec4899",
    },
  ],
  decisions: [],
  advice: [],
};
