import type { PluginBundle } from "./types";

export const educateKidsPlugin: PluginBundle = {
  id: "educate-kids",
  name_he: "חינוך הילדים",
  name_en: "Educating My Children",
  description: "מטרות חינוכיות ארוכות טווח: ערכים, כישורים, רגלי למידה.",
  icon: "GraduationCap",
  ai_prompt_addendum:
    "ההקשר: המשתמש הורה שמנהל יעדים חינוכיים לילדיו. סייע באיזון בין דרישה, סבלנות ועקביות. הציע מיקרו-משימות שבועיות מדידות.",
  color_palette: ["#22c55e", "#f97316", "#3b82f6"],
  objectives: [
    {
      Objective_ID: "OBJ-K01",
      Category: "ערכים והרגלים",
      The_Goal: "להנחיל הרגל קריאה יומי של 20 דקות לפני השינה",
      Priority_Level: "HIGH",
      Status: "ACTIVE",
    },
    {
      Objective_ID: "OBJ-K02",
      Category: "מיומנויות חברתיות",
      The_Goal: "לפתח יכולת הקשבה אקטיבית ופתרון קונפליקטים בגיל הרך",
      Priority_Level: "MEDIUM",
      Status: "ACTIVE",
    },
  ],
  tasks: [
    {
      Task_ID: "TSK-K01",
      Description: "לבחור 3 ספרים חדשים לשבוע הבא",
      Status: "Pending",
      Blocked_By_Task_ID: "NONE",
      AI_Urgency_Level: "MEDIUM",
      Snooze_Counter: 0,
      Re_Evaluate_Timestamp: new Date(Date.now() + 86400000 * 3).toISOString(),
      relations: [],
      color: "#22c55e",
    },
    {
      Task_ID: "TSK-K02",
      Description: "שיחת סוף-יום של 5 דקות עם כל ילד בנפרד",
      Status: "Pending",
      Blocked_By_Task_ID: "NONE",
      AI_Urgency_Level: "HIGH",
      Snooze_Counter: 0,
      Re_Evaluate_Timestamp: new Date(Date.now() + 86400000).toISOString(),
      relations: [],
      color: "#3b82f6",
    },
  ],
  decisions: [],
  advice: [],
};
