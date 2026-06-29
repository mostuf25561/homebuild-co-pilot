# HomeBuild Co-Pilot → Generic "Goal Co-Pilot" Framework

Transform the app from a house-build-specific tool into a generic ADHD-friendly goal/task framework, with the house-build content extracted into a swappable plugin.

## 0. README + progress tracker (do this first, update after each batch)

- Rewrite `README.md` to describe the generic framework (not house building).
- Add a "Roadmap progress" checklist mirroring the batches below. Tick items as each batch lands so future turns can resume without re-reading chat history.

## 1. Plugin system (decouple house data)

Plugins are pure JSON bundles + a generic AI prompt template. House-build data ships as a built-in plugin, not as the seed.

**Bundle shape** (`src/plugins/<id>/plugin.json`):
```
{ id, name_he, name_en, description, icon, categories[],
  objectives[], tasks[], decisions[], advice[],
  ai_prompt_addendum, color_palette }
```

- New folder `src/plugins/` with built-ins: `house-build` (current seed), `educate-kids`, `guitar-progress`.
- `src/lib/plugins.ts`: registry, install/uninstall, import/export. Export strips runtime fields (Status, Snooze_Counter, Re_Evaluate_Timestamp, chat history, progress) — only the goal blueprint travels.
- Store gains `installed_plugins: string[]`, `active_plugin_id`. Seed file becomes empty; install seeds via `installPlugin(id)`.
- Generic system prompt in `src/lib/openrouter.ts`: rewrite to be domain-agnostic (ADHD-friendly supervisor for any goal). Per-plugin `ai_prompt_addendum` is appended only when that plugin is active.
- New `/plugins` route: list installed/available, install/uninstall, import `.json`, export current plugin as shareable JSON.

## 2. Mantra reminder

- Store: `mantras: { id, text, tags[], created_at }[]`.
- `/mantras` route: CRUD list with calm typography.
- Header chip cycles a random mantra (click to open overlay).
- Floating "breathe" button (bottom-left) opens a full-screen calm overlay: large mantra text, slow breathing ring animation, dismiss button. Reachable from any route.

## 3. Color-coded tasks

- Extend `Task` with `color?: string` (preset palette: 8 swatches + "none").
- Color picker in `TaskEditor` and a quick swatch row in the task card.
- Task card left border + small dot reflect the color. Graph node border too.

## 4. Visual category pie (clickable)

- New `/categories` route (or panel on `/objectives`): donut/pie chart of task counts grouped by Objective category (using `recharts` — already available via shadcn `chart.tsx`).
- Each slice colored from the palette; click navigates to `/objectives?category=<cat>` (add filter param) and scrolls/filters to that category.

## 5. Sub-tasks fix + autocomplete

- Extend `Task` with `parent_task_id?: string`.
- New `SubTaskAdder` component: input with autocomplete over existing tasks (reuses `TaskRelationsEditor`'s candidate logic) plus "create new sub-task" path.
- Fix current bug: autocomplete results weren't selectable because the click handler fired before the parent input's blur. Use `onMouseDown` (not `onClick`) on `<li>` items and prevent default — same fix applied to `TaskRelationsEditor`.
- Task cards render nested sub-tasks (indented, collapsible).

## 6. Editable task map (`/graph`)

- **Right-click node menu**: edit, delete, change color, set chronological order index.
- **Edge editor**: click edge → popover to switch kind (before/after/parallel) or delete.
- **Manual layout persistence**: store `task_positions: Record<TaskID, {x,y}>`; node `onNodeDragStop` saves position. Dagre runs only for tasks without a saved position (or on "Auto-arrange" button).
- **Chronological lane mode**: toggle button. When on, render only `before/after` edges and lay out tasks left→right by `chrono_order` (then `Re_Evaluate_Timestamp` fallback). When off, current free-form view.
- Drag-to-create edges is dropped per your note.

## 7. Task relationship types: chronological vs non-chronological

- `RelationKind` already covers `before | after | parallel`; add `related` (non-chronological).
- Task gains `chrono_order?: number`. UI in `TaskRelationsEditor` exposes it as a numeric stepper when at least one `before/after` relation exists.
- Graph lane mode (above) uses this ordering.

## 8. Daily planning (`/today`)

- "Today view over real tasks": shows tasks whose `Re_Evaluate_Timestamp` is today or overdue, plus tasks flagged for today.
- Drag-reorder list (sets per-day order in `daily_plans[date].order[]`).
- Quick-add input creates a real `Task` pre-filled for today.
- Top free-text "day intent" markdown note per date.

## Technical notes

- New deps: `recharts` (likely already in via shadcn chart), `@dnd-kit/sortable` for `/today` reorder.
- Store migrations: add `installed_plugins`, `active_plugin_id`, `mantras`, `task_positions`, `daily_plans`, and on `Task`: `color`, `parent_task_id`, `chrono_order`. `RelationKind` adds `related`. Backfill: existing tasks → no color, no parent, install `house-build` plugin automatically on first migration so existing users keep their seed data visible.
- Generic AI prompt: remove all house/kitchen/plumbing wording; describe role as "supervisor for owner-driven projects".
- All copy Hebrew, RTL preserved.

## Execution order (each batch ends with a README progress tick)

1. README rewrite + roadmap checklist.
2. Plugin extraction + generic AI prompt + `/plugins` route.
3. Sub-tasks fix + color-coded tasks.
4. Category pie + `/today` daily planning.
5. Mantras (page + overlay + header chip).
6. Editable graph (right-click, edge editor, position persistence, lane mode).

Out of scope: real-time collaboration, cloud sync, mobile app shell.
