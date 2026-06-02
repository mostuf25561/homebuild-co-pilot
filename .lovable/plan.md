
# HomeBuild Co-Pilot — Phase 1 MVP Plan

A local-first, Hebrew (RTL) web app for an owner-builder. No backend. Data lives in `localStorage`. AI mutations go through OpenRouter directly from the browser.

## Scope

Three core screens + a global settings/IO panel, all sharing one Zustand store hydrated from `localStorage` and seedable from the provided JSON.

### Screen 1 — `/objectives` — מטרות ורצונות לפי קטגוריה
- Categorized cards grouped by `Category` (מטבח, אינסטלציה, פיתוח חוץ, מקלחות…).
- Each card: goal text, Priority badge (CRITICAL/HIGH/MEDIUM/LOW), Status pill, inline edit, add/delete.
- Filters: priority, status.

### Screen 2 — `/decisions` — עץ החלטות מתועד
- Vertical timeline of decisions. Each node shows:
  - Topic, Final Choice, **Short-term vs. Long-term rationale** (two-column block, always visible).
  - Linked tasks/advice chips.
- Add decision dialog with required short/long rationale fields.

### Screen 3 — `/copilot` — צ'אט פיקוח והתראות (default route)
- Split layout:
  - Left (in RTL = visual right): **Alerts rail** — CRITICAL tasks, items needing re-evaluation (by `Re_Evaluate_Timestamp`), blocked tasks. Each alert exposes **Yes / No / Delay** macro buttons that mutate state directly.
  - Right (visual left): **Chat** with OpenRouter. Streaming responses, message history per session in `localStorage`.
- AI replies in two parts: a natural-language Hebrew message + a JSON `actions[]` block (extracted via tool-calling / fenced JSON) that the store applies: `add_task`, `update_task`, `add_decision`, `flag_task`, `snooze_task`, `add_objective`.

## Global UI
- Persistent top bar: app title, settings button, **Import JSON / Export JSON** buttons (Export downloads current state; Import replaces it after confirm dialog).
- Sidebar nav (RTL) with the 3 screens.
- RTL throughout: `<html dir="rtl" lang="he">`, Heebo font via `@fontsource/heebo`.

## Data Model (localStorage key `homebuild:v1`)
Mirrors the provided JSON:
- `objectives[]` — Objective_ID, Category, The_Goal, Priority_Level, Status
- `tasks[]` — Task_ID, Description, Status, Blocked_By_Task_ID, AI_Urgency_Level, Snooze_Counter, Re_Evaluate_Timestamp
- `decisions[]` — Decision_ID, Topic, Final_Choice_Made, Rationale_Short_vs_Long_Term, Linked_Advice_ID
- `advice[]`, `assets[]`
- `chat_messages[]`
- `settings` — `openrouter_api_key`, `model_route` (default `openrouter/auto:free`), `system_prompt`

Seeded on first launch with the user's provided JSON.

## AI Layer (direct browser → OpenRouter)
- Settings page: API key input (password field, stored in `localStorage`), model select (`openrouter/auto:free`, `google/gemini-2.5-flash:free`, custom).
- `callOpenRouter(messages, state)` → `POST https://openrouter.ai/api/v1/chat/completions` with system prompt that:
  - Injects current state snapshot (compact JSON).
  - Instructs the model to respond in Hebrew + emit a fenced ```json actions``` block.
- Action applier validates each action with Zod and mutates the store; UI re-renders.
- Errors (401/429/network) shown as Hebrew toasts.

## Technical Details
- TanStack Start routes: `src/routes/index.tsx` (redirect → `/copilot`), `/copilot`, `/objectives`, `/decisions`, `/settings`.
- State: Zustand + `persist` middleware to `localStorage`.
- Validation: Zod schemas for state + AI actions.
- Styling: shadcn components + design tokens in `src/styles.css` (warm neutral palette, construction-site inspired accent). Add semantic tokens for priority levels (critical/high/medium/low) and status pills.
- Font: Heebo via `@fontsource/heebo`.
- Markdown rendering for chat: `react-markdown`.
- All copy in Hebrew.

```text
src/
  routes/
    __root.tsx        (RTL shell, top bar, sidebar)
    index.tsx         (redirect → /copilot)
    copilot.tsx
    objectives.tsx
    decisions.tsx
    settings.tsx
  components/
    TopBar.tsx, Sidebar.tsx, ImportExportPanel.tsx
    PriorityBadge.tsx, StatusPill.tsx
    AlertRail.tsx, ChatPanel.tsx
    ObjectiveCard.tsx, DecisionNode.tsx
  lib/
    store.ts          (Zustand + persist)
    seed.ts           (provided JSON as initial state)
    openrouter.ts     (chat call + action parsing)
    actions.ts        (Zod action schemas + applier)
    schemas.ts
```

## Out of Scope (Phase 1)
- No Lovable Cloud / no auth / no remote DB.
- No image upload (assets registry shown read-only).
- No notifications/cron — re-evaluation surfaced in the Alerts rail only.

Ready to build on approval.
