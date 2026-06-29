# Goal Co-Pilot — מסגרת ADHD-Friendly לניהול יעדים

A generic, local-first task & goal framework designed for people with ADHD/ADD who need
help organizing long-running personal projects (building a house, educating kids, learning
guitar, anything). Everything lives in `localStorage`. AI runs through OpenRouter directly
from the browser.

The app used to be "HomeBuild Co-Pilot" — that domain is now one of several **plugins**
you can install, share, and swap.

## Concepts

- **Plugin** — a shareable JSON bundle of objectives + tasks + decisions + an optional
  AI prompt addendum for one life domain. Built-ins: `house-build`, `educate-kids`,
  `guitar-progress`. Import/export to share with friends; runtime progress is stripped on
  export.
- **Task** — atomic action item with status, urgency, color tag, optional parent task
  (sub-tasks), and typed relations (`before` / `after` / `parallel` / `related`).
- **Decision** — choice you made, with short-term vs long-term rationale.
- **Mantra** — calming phrase, surfaced through a header chip or a full-screen breathing
  overlay when you feel overwhelmed.
- **Daily plan** — today-focused view of overdue + due-today tasks with free-text intent
  note.

## Roadmap progress

- [x] Phase 1 — MVP (objectives, tasks, decisions, copilot chat)
- [x] Phase 2 batch 1 — Themes (light/dark/blue), collapsibles, task graph, relations
- [x] Phase 3 batch 0 — README + roadmap tracker
- [x] Phase 3 batch 1 — Plugin extraction + generic AI prompt + `/plugins` route
- [x] Phase 3 batch 2 — Sub-tasks fix + color-coded tasks
- [x] Phase 3 batch 3 — Category pie + `/today` daily planning
- [x] Phase 3 batch 4 — Mantras (page + overlay + header chip)
- [x] Phase 3 batch 5 — Editable graph (context menu, edge editor, position persistence, lane mode)

## Stack

TanStack Start (Vite) · React 19 · Tailwind v4 · Zustand persist · ReactFlow · Recharts ·
@dnd-kit · OpenRouter API.

Project URL: <https://lovable.dev/projects/2d15fdd5-fd4c-46d1-82b9-75e0d0f957dc>
