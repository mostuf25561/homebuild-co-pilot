import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { HardHat, MessageSquare, Target, GitBranch, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImportExportPanel } from "./ImportExportPanel";

const NAV = [
  { to: "/copilot", label: "צ'אט פיקוח", icon: MessageSquare },
  { to: "/objectives", label: "מטרות ורצונות", icon: Target },
  { to: "/decisions", label: "עץ החלטות", icon: GitBranch },
  { to: "/settings", label: "הגדרות", icon: Settings },
] as const;

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-card/80 backdrop-blur">
        <div className="flex items-center justify-between px-4 h-14 gap-4">
          <Link to="/copilot" className="flex items-center gap-2 font-extrabold text-lg">
            <HardHat className="size-6 text-primary" />
            <span>HomeBuild Co-Pilot</span>
          </Link>
          <ImportExportPanel />
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
        <main className="flex-1 min-w-0 overflow-auto">
          <Outlet />
        </main>
      </div>
      {/* Mobile bottom nav */}
      <nav className="md:hidden border-t bg-card grid grid-cols-4">
        {NAV.map((n) => {
          const active = pathname.startsWith(n.to);
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex flex-col items-center gap-1 py-2 text-xs",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              {n.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
