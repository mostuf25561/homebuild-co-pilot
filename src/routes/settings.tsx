import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, Check } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: () => (
    <AppShell>
      <SettingsPage />
    </AppShell>
  ),
});

const MODELS = [
  "openrouter/auto:free",
  "google/gemini-2.5-flash:free",
  "deepseek/deepseek-chat-v3.1:free",
  "meta-llama/llama-3.3-70b-instruct:free",
];

function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);
  const [draft, setDraft] = useState(settings);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSettings(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold">הגדרות</h1>
        <p className="text-sm text-muted-foreground mt-1">
          כל הנתונים נשמרים מקומית בדפדפן בלבד. מפתח ה-API לא נשלח לאף שרת חיצוני מלבד OpenRouter.
        </p>
      </div>

      <Card className="p-5 space-y-4">
        <div>
          <h2 className="font-bold mb-2">חיבור ל-OpenRouter</h2>
          <label className="text-sm font-medium block mb-1.5">מפתח API</label>
          <div className="flex gap-2">
            <Input
              type={show ? "text" : "password"}
              value={draft.openrouter_api_key}
              onChange={(e) => setDraft({ ...draft, openrouter_api_key: e.target.value })}
              placeholder="sk-or-v1-..."
              dir="ltr"
            />
            <Button size="icon" variant="outline" onClick={() => setShow((v) => !v)}>
              {show ? <EyeOff /> : <Eye />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">
            השג מפתח חינמי ב-
            <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="underline text-primary">
              openrouter.ai/keys
            </a>
          </p>
        </div>

        <div>
          <label className="text-sm font-medium block mb-1.5">מודל</label>
          <select
            className="w-full border rounded-md px-3 py-2 text-sm bg-background"
            value={draft.model_route}
            onChange={(e) => setDraft({ ...draft, model_route: e.target.value })}
            dir="ltr"
          >
            {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
            {!MODELS.includes(draft.model_route) && (
              <option value={draft.model_route}>{draft.model_route}</option>
            )}
          </select>
          <Input
            className="mt-2"
            placeholder="או הזן מודל מותאם..."
            value={draft.model_route}
            onChange={(e) => setDraft({ ...draft, model_route: e.target.value })}
            dir="ltr"
          />
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <h2 className="font-bold">System Prompt</h2>
        <p className="text-xs text-muted-foreground">
          הנחיות הליבה ל-AI. הפרומפט נשלח עם כל הודעה יחד עם תמונת המצב הנוכחית של הנתונים.
        </p>
        <Textarea
          value={draft.system_prompt}
          onChange={(e) => setDraft({ ...draft, system_prompt: e.target.value })}
          rows={8}
          className="text-sm"
        />
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={save}><Check /> שמור הגדרות</Button>
        {saved && <span className="text-sm text-low-foreground">נשמר ✓</span>}
      </div>
    </div>
  );
}
