import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { BUILTIN_PLUGINS, findPlugin } from "@/plugins/registry";
import { stripRuntime, type PluginBundle } from "@/plugins/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, Trash2, Plus, Check, Star } from "lucide-react";
import { useRef } from "react";

export const Route = createFileRoute("/plugins")({
  component: () => (
    <AppShell>
      <PluginsPage />
    </AppShell>
  ),
});

function PluginsPage() {
  const installed = useStore((s) => s.installed_plugins);
  const active = useStore((s) => s.active_plugin_id);
  const installPlugin = useStore((s) => s.installPlugin);
  const uninstallPlugin = useStore((s) => s.uninstallPlugin);
  const setActive = useStore((s) => s.setActivePlugin);
  const fileRef = useRef<HTMLInputElement>(null);
  const [customs, setCustoms] = useState<PluginBundle[]>([]);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const bundle = JSON.parse(text) as PluginBundle;
      if (!bundle.id || !bundle.name_he) throw new Error("Bundle לא תקין");
      installPlugin(bundle);
      setCustoms((c) => [...c, bundle]);
      alert(`הותקן: ${bundle.name_he}`);
    } catch (err) {
      alert("קובץ Plugin לא תקין: " + (err as Error).message);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const exportPlugin = (id: string) => {
    const bundle = findPlugin(id) || customs.find((c) => c.id === id);
    if (!bundle) return alert("לא ניתן לייצא Plugin זה");
    const blob = new Blob([JSON.stringify(stripRuntime(bundle), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plugin-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const all = [...BUILTIN_PLUGINS, ...customs.filter((c) => !BUILTIN_PLUGINS.some((b) => b.id === c.id))];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">תוספים (Plugins)</h1>
          <p className="text-sm text-muted-foreground mt-1">
            כל תוסף הוא חבילה של מטרות ומשימות לתחום חיים אחד. אפשר להחליף, לייבא ולשתף.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload /> ייבא JSON
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImport}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {all.map((p) => {
          const isInstalled = installed.includes(p.id);
          const isActive = active === p.id;
          return (
            <Card key={p.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    {p.name_he}
                    {isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground flex items-center gap-1">
                        <Star className="size-3" /> פעיל
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-muted-foreground">{p.name_en}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed">{p.description}</p>
              <div className="text-xs text-muted-foreground flex gap-4">
                <span>מטרות: {p.objectives.length}</span>
                <span>משימות: {p.tasks.length}</span>
                <span>החלטות: {p.decisions.length}</span>
              </div>
              <div className="flex gap-2 flex-wrap pt-1">
                {!isInstalled ? (
                  <Button size="sm" onClick={() => installPlugin(p)}>
                    <Plus /> התקן
                  </Button>
                ) : (
                  <>
                    {!isActive && (
                      <Button size="sm" variant="outline" onClick={() => setActive(p.id)}>
                        <Check /> הפוך לפעיל
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        confirm(`להסיר את ${p.name_he}? הנתונים שלו יימחקו.`) &&
                        uninstallPlugin(p.id)
                      }
                    >
                      <Trash2 /> הסר
                    </Button>
                  </>
                )}
                <Button size="sm" variant="ghost" onClick={() => exportPlugin(p.id)}>
                  <Download /> ייצא
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
