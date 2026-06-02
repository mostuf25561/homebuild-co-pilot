import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useStore, type Decision } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, GitBranch, Clock, Hourglass } from "lucide-react";

export const Route = createFileRoute("/decisions")({
  component: () => (
    <AppShell>
      <DecisionsPage />
    </AppShell>
  ),
});

function DecisionsPage() {
  const decisions = useStore((s) => s.decisions);
  const add = useStore((s) => s.addDecision);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ Topic: "", Final_Choice_Made: "", Rationale_Short_vs_Long_Term: "" });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">עץ החלטות מתועד</h1>
          <p className="text-sm text-muted-foreground mt-1">
            כל החלטה מתועדת עם נימוק טווח קצר מול טווח ארוך.
          </p>
        </div>
        <Button onClick={() => setAdding((v) => !v)}>
          <Plus /> החלטה חדשה
        </Button>
      </div>

      {adding && (
        <Card className="p-4 space-y-3 border-primary">
          <Input
            placeholder="נושא ההחלטה"
            value={draft.Topic}
            onChange={(e) => setDraft({ ...draft, Topic: e.target.value })}
          />
          <Input
            placeholder="הבחירה הסופית"
            value={draft.Final_Choice_Made}
            onChange={(e) => setDraft({ ...draft, Final_Choice_Made: e.target.value })}
          />
          <Textarea
            placeholder="נימוק: טווח קצר מול טווח ארוך"
            value={draft.Rationale_Short_vs_Long_Term}
            onChange={(e) => setDraft({ ...draft, Rationale_Short_vs_Long_Term: e.target.value })}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setAdding(false)}>ביטול</Button>
            <Button
              onClick={() => {
                if (!draft.Topic.trim()) return;
                add(draft);
                setDraft({ Topic: "", Final_Choice_Made: "", Rationale_Short_vs_Long_Term: "" });
                setAdding(false);
              }}
            >שמור</Button>
          </div>
        </Card>
      )}

      <div className="relative space-y-4 ps-8">
        <div className="absolute top-2 bottom-2 end-3 w-px bg-border" />
        {decisions.map((d) => <DecisionNode key={d.Decision_ID} decision={d} />)}
      </div>
    </div>
  );
}

function DecisionNode({ decision }: { decision: Decision }) {
  const del = useStore((s) => s.deleteDecision);
  const isPending = /ממתין/.test(decision.Final_Choice_Made);

  // Try to split rationale into short / long pieces if formatted that way.
  const txt = decision.Rationale_Short_vs_Long_Term;
  const shortMatch = txt.match(/טווח קצר[:：]?\s*([^.]+?\.?)(?=\s*טווח ארוך|$)/);
  const longMatch = txt.match(/טווח ארוך[:：]?\s*(.+)$/);

  return (
    <Card className="p-4 space-y-3 relative">
      <div
        className="absolute -end-7 top-5 size-4 rounded-full bg-primary ring-4 ring-background flex items-center justify-center"
        aria-hidden
      >
        <GitBranch className="size-2.5 text-primary-foreground" />
      </div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold">{decision.Topic}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{decision.Decision_ID}</p>
        </div>
        <Button size="icon" variant="ghost" className="size-7"
          onClick={() => confirm("למחוק החלטה?") && del(decision.Decision_ID)}>
          <Trash2 className="size-3.5" />
        </Button>
      </div>
      <div className={`flex items-center gap-2 text-sm font-medium ${isPending ? "text-medium-foreground" : ""}`}>
        {isPending ? <Hourglass className="size-4" /> : <Clock className="size-4" />}
        <span>{decision.Final_Choice_Made}</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        <div className="rounded-lg border bg-muted/40 p-3">
          <div className="text-xs font-bold text-muted-foreground mb-1">טווח קצר</div>
          <p className="text-sm leading-relaxed">
            {shortMatch ? shortMatch[1].trim() : txt}
          </p>
        </div>
        <div className="rounded-lg border bg-muted/40 p-3">
          <div className="text-xs font-bold text-muted-foreground mb-1">טווח ארוך</div>
          <p className="text-sm leading-relaxed">
            {longMatch ? longMatch[1].trim() : "—"}
          </p>
        </div>
      </div>
    </Card>
  );
}
