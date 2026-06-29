import { Link, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Sparkles,
  MessageSquare,
  Target,
  GitBranch,
  Settings,
  Network,
  CalendarDays,
  PieChart,
  Puzzle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ImportExportPanel } from "./ImportExportPanel";
import { ThemeSwitcher, useApplyTheme } from "./ThemeSwitcher";
import { ReturnButton } from "./ReturnButton";
import { MantraOverlay, MantraChip, MantraFloatingButton } from "./MantraOverlay";

const NAV = [
  { to: "/copilot", label: "צ'אט", icon: MessageSquare },
  { to: "/today", label: "היום", icon: CalendarDays },
  { to: "/objectives", label: "מטרות", icon: Target },
  { to: "/categories", label: "קטגוריות", icon: PieChart },
  { to: "/graph", label: "מפה", icon: Network },
  { to: "/decisions", label: "החלטות", icon: GitBranch },
  { to: "/mantras", label: "מנטרות", icon: Sparkles },
  { to: "/plugins", label: "תוספים", icon: Puzzle },
  { to: "/settings", label: "הגדרות", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  useApplyTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mantraOpen, setMantraOpen] = useState(false);
  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-card/80 backdrop-blur">
        <div className="flex items-center justify-between px-4 h-14 gap-4">
          <Link to="/copilot" className="flex items-center gap-2 font-extrabold text-lg">
            <Sparkles className="size-6 text-primary" />
            <span>Goal Co-Pilot</span>
          </Link>
          <div className="flex items-center gap-3">
            <MantraChip onOpen={() => setMantraOpen(true)} />
            <ThemeSwitcher />
            <ImportExportPanel />
          </div>
        </div>
      </header>
      <div className="flex flex-1 min-h-0">
        <nav className="w-56 shrink-0 border-l bg-card/40 p-3 hidden md:block">
          <ul className="space-y-1">
            {NAV.map((n) => {
              const active = pathname.startsWith(n.to);
              const Icon = n.icon;
              return (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground shadow"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <main className="flex-1 min-w-0 overflow-auto">{children}</main>
      </div>
      {/* Mobile bottom nav — first 5 items */}
      <nav className="md:hidden border-t bg-card grid grid-cols-5">
        {NAV.slice(0, 5).map((n) => {
          const active = pathname.startsWith(n.to);
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex flex-col items-center gap-1 py-2 text-[11px]",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <MantraFloatingButton onOpen={() => setMantraOpen(true)} />
      <MantraOverlay open={mantraOpen} onClose={() => setMantraOpen(false)} />
      <ReturnButton />
    </div>
  );
}
