import { useEffect } from "react";
import { Sun, Moon, Droplet } from "lucide-react";
import { useStore, type ThemeMode } from "@/lib/store";
import { cn } from "@/lib/utils";

const THEMES: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "בהיר", icon: Sun },
  { value: "dark", label: "כהה", icon: Moon },
  { value: "blue", label: "כחול", icon: Droplet },
];

export function useApplyTheme() {
  const theme = useStore((s) => s.settings.theme);
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("dark", "theme-blue");
    if (theme === "dark") root.classList.add("dark");
    if (theme === "blue") root.classList.add("theme-blue");
  }, [theme]);
}

export function ThemeSwitcher() {
  const theme = useStore((s) => s.settings.theme);
  const setSettings = useStore((s) => s.setSettings);
  return (
    <div className="inline-flex rounded-md border bg-card p-0.5">
      {THEMES.map((t) => {
        const Icon = t.icon;
        const active = theme === t.value;
        return (
          <button
            key={t.value}
            onClick={() => setSettings({ theme: t.value })}
            title={t.label}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon className="size-3.5" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
