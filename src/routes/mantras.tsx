import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, Sparkles } from "lucide-react";
import { MantraOverlay } from "@/components/MantraOverlay";

export const Route = createFileRoute("/mantras")({
  component: () => (
    <AppShell>
      <MantrasPage />
    </AppShell>
  ),
});

function MantrasPage() {
  const mantras = useStore((s) => s.mantras);
  const addMantra = useStore((s) => s.addMantra);
  const deleteMantra = useStore((s) => s.deleteMantra);
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [overlay, setOverlay] = useState(false);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">מנטרות לרגעי שקט</h1>
          <p className="text-sm text-muted-foreground mt-1">
            תזכורות אישיות שעוזרות להירגע ולמקד. "אנחנו רק אורחים בעולם הזה."
          </p>
        </div>
        <Button onClick={() => setOverlay(true)}>
          <Sparkles /> פתח מסך מנטרה
        </Button>
      </div>

      <Card className="p-4 space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="כתוב מנטרה חדשה..."
          rows={2}
        />
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="תגיות מופרדות בפסיק (אופציונלי)"
          className="text-sm"
        />
        <div className="flex justify-end">
          <Button
            onClick={() => {
              if (!text.trim()) return;
              addMantra({
                text: text.trim(),
                tags: tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              });
              setText("");
              setTags("");
            }}
          >
            <Plus /> הוסף
          </Button>
        </div>
      </Card>

      <div className="space-y-3">
        {mantras.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            אין מנטרות עדיין. הוסף את הראשונה למעלה.
          </p>
        )}
        {mantras.map((m) => (
          <Card key={m.id} className="p-4 flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-base leading-relaxed">{m.text}</p>
              {m.tags.length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {m.tags.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="size-7"
              onClick={() => confirm("למחוק את המנטרה?") && deleteMantra(m.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </Card>
        ))}
      </div>

      <MantraOverlay open={overlay} onClose={() => setOverlay(false)} />
    </div>
  );
}
