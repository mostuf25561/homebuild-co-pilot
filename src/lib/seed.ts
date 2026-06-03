import type { AppState } from "./store";

export const SEED: AppState = {
  objectives: [
    {
      Objective_ID: "OBJ-201",
      Category: "מטבח ותכנון חלל",
      The_Goal:
        "תכנון מחדש של המטבח לניצול מיטבי של משטח השיש ופתרון בעיות זרימה, תוך עצירת עבודות בשטח למניעת פגיעה בתשתיות.",
      Priority_Level: "CRITICAL",
      Status: "ACTIVE",
    },
    {
      Objective_ID: "OBJ-202",
      Category: "אינסטלציה ואופטימיזציה",
      The_Goal:
        "הוזלת רכיב הקצה של המתיזן בשירותים עקב היעדר תשתית מים חמים בשטח.",
      Priority_Level: "LOW",
      Status: "ACTIVE",
    },
    {
      Objective_ID: "OBJ-203",
      Category: "פיתוח חוץ וגינון",
      The_Goal:
        "הקמת מערכת השקיה ממוחשבת מפוצלת (עצי פרי, דשא, ירק) עם תשתית חשמל ייעודית צמודה לברז.",
      Priority_Level: "HIGH",
      Status: "ACTIVE",
    },
    {
      Objective_ID: "OBJ-204",
      Category: "תכנון מקלחות ואינסטלציה",
      The_Goal:
        "בחינת היתכנות והחלטה לגבי הוספת אמבטיה במקלחת הורים (משפיע על מיקומי ניקוז וברזים בשטח).",
      Priority_Level: "HIGH",
      Status: "ACTIVE",
    },
  ],
  tasks: [
    {
      Task_ID: "TSK-301",
      Description:
        "פנייה דחופה להנהלת הפרויקט לעצירת עבודות אינסטלציה וחשמל במטבח למשך השבוע הקרוב",
      Status: "Pending",
      Blocked_By_Task_ID: "NONE",
      AI_Urgency_Level: "CRITICAL",
      Snooze_Counter: 0,
      Re_Evaluate_Timestamp: "2026-06-03T12:00:00Z",
      relations: [],
    },
    {
      Task_ID: "TSK-302",
      Description:
        "פגישה ביומן עם מעצב מטבחים אלטרנטיבי א' לקבלת תוכנית חלופית לשיפור משטח השיש",
      Status: "Pending",
      Blocked_By_Task_ID: "TSK-301",
      AI_Urgency_Level: "HIGH",
      Snooze_Counter: 0,
      Re_Evaluate_Timestamp: "2026-06-05T16:00:00Z",
      relations: [],
    },
    {
      Task_ID: "TSK-303",
      Description:
        "פגישה ביומן עם מעצב מטבחים אלטרנטיבי ב' לקבלת סקיצה נוספת לניצול השטח",
      Status: "Pending",
      Blocked_By_Task_ID: "TSK-301",
      AI_Urgency_Level: "HIGH",
      Snooze_Counter: 0,
      Re_Evaluate_Timestamp: "2026-06-07T11:00:00Z",
      relations: [],
    },
    {
      Task_ID: "TSK-304",
      Description:
        "וידוא זמינות קבצי דיגיטל בנייד (תוכנית בנייה, חשמל ואינסטלציה) לפני היציאה לפגישות המעצבים",
      Status: "Pending",
      Blocked_By_Task_ID: "NONE",
      AI_Urgency_Level: "HIGH",
      Snooze_Counter: 0,
      Re_Evaluate_Timestamp: "2026-06-05T00:00:00Z",
      relations: [],
    },
    {
      Task_ID: "TSK-305",
      Description:
        "רכישת רכיב קצה מוזל למתיזן בשירותים: ברז פשוט עם שליטה בעוצמת הזרם בלבד (ללא מיקסר חמים)",
      Status: "Pending",
      Blocked_By_Task_ID: "NONE",
      AI_Urgency_Level: "LOW",
      Snooze_Counter: 0,
      Re_Evaluate_Timestamp: "2026-06-15T00:00:00Z",
      relations: [],
    },
    {
      Task_ID: "TSK-306",
      Description:
        "ביקור באתר בניה ביום X: בדיקה פיזית שקיימת נקודת חשמל אטומה סמוכה לברז הגינה החיצוני",
      Status: "Pending",
      Blocked_By_Task_ID: "NONE",
      AI_Urgency_Level: "HIGH",
      Snooze_Counter: 0,
      Re_Evaluate_Timestamp: "2026-06-06T08:00:00Z",
      relations: [],
    },
    {
      Task_ID: "TSK-307",
      Description:
        "התייעצות עם אבא לגבי מפרט מערכת ההשקיה הנדרשת ומספר הברזים/קווים לפיצול צמחייה",
      Status: "Pending",
      Blocked_By_Task_ID: "NONE",
      AI_Urgency_Level: "MEDIUM",
      Snooze_Counter: 0,
      Re_Evaluate_Timestamp: "2026-06-04T20:00:00Z",
      relations: [],
    },
    {
      Task_ID: "TSK-308",
      Description:
        "לקחת מד מטר מאבא למדידה פיזית באתר הבניה, ולרשום על דף את גובה החלון והמרחק שלו מקצה הקיר",
      Status: "Pending",
      Blocked_By_Task_ID: "NONE",
      AI_Urgency_Level: "HIGH",
      Snooze_Counter: 0,
      Re_Evaluate_Timestamp: "2026-06-06T07:30:00Z",
      relations: [],
    },
    {
      Task_ID: "TSK-309",
      Description:
        "תיאום ושיחה עם X לגבי האפשרות והמשמעויות של בניית אמבטיה במקלחת הורים (לפני סגירת אינסטלציה)",
      Status: "Pending",
      Blocked_By_Task_ID: "NONE",
      AI_Urgency_Level: "HIGH",
      Snooze_Counter: 0,
      Re_Evaluate_Timestamp: "2026-06-04T18:00:00Z",
      relations: [],
    },
  ],
  decisions: [
    {
      Decision_ID: "DEC-301",
      Topic: "עיכוב שלד מול שינוי תוכנית מטבח",
      Final_Choice_Made: "הקפאת עבודות שטח במטבח לטובת סבב מעצבים",
      Rationale_Short_vs_Long_Term:
        "טווח קצר: סיכון מול מנהל העבודה. טווח ארוך: משטח עבודה לא יעיל במטבח יגרום לעוגמת נפש יומיומית. הגישה ההגנתית מחייבת עצירה עכשיו.",
      Linked_Advice_ID: "NONE",
    },
    {
      Decision_ID: "DEC-302",
      Topic: "פרזול מתיזן אסלה",
      Final_Choice_Made: "הוזלת עלות ורכישת מנגנון שליטה בעוצמה בלבד",
      Rationale_Short_vs_Long_Term:
        "בפועל האינסטלטור לא חיבר צינור מים חמים למתיזן. אין טעם לרכוש סוללה משולבת יקרה. חיסכון כספי ללא פגיעה בפונקציונליות הקיימת.",
      Linked_Advice_ID: "NONE",
    },
    {
      Decision_ID: "DEC-303",
      Topic: "אמבטיה במקלחת הורים - כן או לא",
      Final_Choice_Made: "ממתין לדיון עם X",
      Rationale_Short_vs_Long_Term:
        "הוספת אמבטיה דורשת שינוי מהותי במיקומי הניקוז וקווי המים בשטח בהשוואה למקלחון רגיל. חובה להחליט לפני שהאינסטלטור מסיים את פריסת הצנרת בחדר.",
      Linked_Advice_ID: "NONE",
    },
  ],
  advice: [
    {
      Advice_ID: "ADV-501",
      Source_Name: "עובדות בשטח (סטטוס אינסטלטור)",
      Advice_Content:
        "בוצע חיבור נקודת ניקוז ומים לכיור לפי התוכנית הישנה והפגומה. כל עבודה נוספת של הקבלן באזור זה תקבע עובדות קשיחות ויקרות לשינוי.",
      Contractor_Claim_Verification_Status: "CRITICAL_CONFLICT",
    },
    {
      Advice_ID: "ADV-502",
      Source_Name: "AI Co-Pilot (אופטימיזציית השקיה)",
      Advice_Content:
        'גינה הכוללת עצי פרי, דשא וגינת ירק דורשת מחשב השקיה של לפחות 3 ברזים (קווים נפרדים) בשל צרכי מים וזמני השקיה שונים לחלוטין. עלות מוערכת לראש מערכת: 800-1400 ש"ח. מניעת כאב ראש: מסנן ייעודי למניעת סתימות בטפטפות.',
      Contractor_Claim_Verification_Status: "VERIFIED_BY_AI",
    },
  ],
  assets: [
    {
      Asset_ID: "IMG-601",
      Google_Drive_Photo_URL:
        "https://drive.google.com/file/d/kitchen-infrastructure-current/view",
      Structural_Tag: "Sub-floor Plumbing (Kitchen Sink Context)",
      Linked_Task_ID: "TSK-301",
    },
  ],
  chat_messages: [],
  settings: {
    openrouter_api_key: "",
    model_route: "openrouter/auto:free",
    theme: "light",
    ui_collapsed: {},
    system_prompt:
      "You are 'HomeBuild Co-Pilot', a defensive, high-accountability AI supervisor for an owner-builder. Default language for interaction is Hebrew (RTL). Assume official site managers and inspectors are prone to oversights. Intercept upcoming construction milestones. Force verification workflows. When the user faces critical-path item bottlenecks, do not allow vague text inputs; present structural Yes/No/Delay choices. Rely strictly on Data State changes rather than raw conversation logs to alter timeline pipelines.",
  },
};
