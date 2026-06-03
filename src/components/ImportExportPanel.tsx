import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { Download, Upload, RotateCcw } from "lucide-react";

export function ImportExportPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const exportJSON = useStore((s) => s.exportJSON);
  const hydrate = useStore((s) => s.hydrate);
  const reset = useStore((s) => s.resetToSeed);

  const onExport = () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `homebuild-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!confirm("ייבוא יחליף את כל הנתונים הקיימים. להמשיך?")) {
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    const text = await file.text();
    try {
      const parsed = JSON.parse(text);
      hydrate(parsed);
      alert("הנתונים יובאו בהצלחה");
    } catch {
      alert("קובץ JSON לא תקין");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" onClick={onExport}>
        <Download /> ייצוא
      </Button>
      <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
        <Upload /> ייבוא
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => confirm("לאפס לנתוני ברירת המחדל?") && reset()}
      >
        <RotateCcw /> איפוס
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={onImport}
      />
    </div>
  );
}
