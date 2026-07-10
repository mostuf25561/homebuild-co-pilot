# Demo video pipeline

End-to-end reproducible pipeline that produces the animated GIF embedded at
the top of the root [`README.md`](../README.md).

```
Playwright  ──►  public/shots/*.png  ──►  Remotion  ──►  out/demo.mp4  ──►  ffmpeg  ──►  out/demo.gif
 (real app)      (one per scene)         (React/TSX)        (h264)                    (GIF for README)
```

Nothing here is generated at page-load time — the GIF is a static asset
committed to the CDN via `lovable-assets`. Re-running the pipeline overwrites
`out/demo.gif`; upload it again to update the README.

## Segment ↔ text overlay map

The single source of truth is [`src/segments.ts`](./src/segments.ts). Each
entry becomes one scene, in order. Change copy, duration, accent color, or the
screenshot — no other file needs to change.

| # | id           | shot (public/shots/) | title                      | subtitle                                                | frames | accent  |
| - | ------------ | -------------------- | -------------------------- | ------------------------------------------------------- | -----: | ------- |
| 1 | `intro`      | `copilot.png`        | Goal Co-Pilot              | An ADHD-friendly framework for owner-driven projects    |     90 | #B4531A |
| 2 | `today`      | `today.png`          | Plan your day              | Free-text intent + drag-reorderable tasks due today     |     90 | #3B82F6 |
| 3 | `objectives` | `objectives.png`     | Objectives & tasks         | Color-coded, sub-tasked, typed relations                |     90 | #10B981 |
| 4 | `categories` | `categories.png`     | See where focus goes       | Click a slice to jump to that category                  |     80 | #F59E0B |
| 5 | `graph`      | `graph.png`          | Editable task map          | Right-click nodes · edit edges · chrono lane mode       |     90 | #8B5CF6 |
| 6 | `mantras`    | `mantras.png`        | Ground yourself            | Mantras + full-screen breathing overlay                 |     80 | #EC4899 |
| 7 | `plugins`    | `plugins.png`        | Swap the whole domain      | Plugins = JSON bundles you can share                    |     90 | #0EA5E9 |
| 8 | `outro`      | `copilot.png`        | Local-first. Yours.        | Everything stays in your browser                        |     70 | #B4531A |

30 fps → total ≈ 22.7 s. Composition is `1280×720`.

## Reproduce the video

Prereqs in the Lovable sandbox: `bun`, `node`, `ffmpeg`, `chromium` (all
pre-installed). The app dev server must be running on `http://localhost:8080`.

### 1. Capture fresh screenshots (only when the UI changes)

```bash
python3 - <<'PY'
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

OUT = Path("remotion/public/shots"); OUT.mkdir(parents=True, exist_ok=True)
ROUTES = [
    ("copilot","/copilot"), ("today","/today"), ("objectives","/objectives"),
    ("categories","/categories"), ("graph","/graph"), ("mantras","/mantras"),
    ("plugins","/plugins"), ("decisions","/decisions"),
]

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        ctx = await b.new_context(viewport={"width":1440,"height":900}, device_scale_factor=2)
        page = await ctx.new_page()
        for name, path in ROUTES:
            await page.goto(f"http://localhost:8080{path}", wait_until="networkidle", timeout=15000)
            await page.wait_for_timeout(1200)
            await page.screenshot(path=str(OUT/f"{name}.png"))
        await b.close()

asyncio.run(main())
PY
```

Add a route → add a shot filename here → add the segment in `src/segments.ts`.

### 2. Install Remotion (once)

```bash
cd remotion
bun install
# Patch: the bundled glibc compositor doesn't run on NixOS — use the musl one.
mkdir -p node_modules/@remotion/compositor-linux-x64-gnu
cp node_modules/@remotion/compositor-linux-x64-musl/remotion \
   node_modules/@remotion/compositor-linux-x64-gnu/remotion
chmod +x node_modules/@remotion/compositor-linux-x64-gnu/remotion
ln -sf "$(which ffmpeg)"  node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg
ln -sf "$(which ffprobe)" node_modules/@remotion/compositor-linux-x64-gnu/ffprobe
```

### 3. Render MP4

```bash
cd remotion && node scripts/render.mjs
# → remotion/out/demo.mp4
```

The render script uses `chromeMode: "chrome-for-testing"`, `muted: true`, and
`concurrency: 1` — required for the sandbox Chromium.

### 4. Convert to GIF

```bash
cd remotion && node scripts/to-gif.mjs
# → remotion/out/demo.gif   (~3-4 MB at 560px / 8fps / 96 colors)
```

Tune the three constants at the top of `scripts/to-gif.mjs` to trade quality
for size:

- `FPS` — 8 is fine for UI motion; bump to 12 for smoother animation
- `WIDTH` — 560 keeps the GIF < 4 MB; 720 doubles the file size
- `MAX_COLORS` — 96 handles this palette; drop to 64 for smaller files

### 5. Publish to the CDN and update the README

```bash
lovable-assets create --file remotion/out/demo.gif --filename goal-copilot-demo.gif \
  > src/assets/goal-copilot-demo.gif.asset.json
```

Copy the `url` field from the printed JSON and replace the `add-task.lovable.app`
URL in the root `README.md`'s first image tag. (The `/__l5e/...` path is served
under any Lovable deployment of this project.)

## Design choices

- **Ken Burns per scene** — subtle 1.04 → 1.12 scale keeps static screenshots
  feeling alive without becoming distracting.
- **Bottom-gradient overlay** — legible titles regardless of the shot's
  background color, without hiding the UI.
- **Per-scene accent bar + glow** — every scene gets one identity color; the
  transitions between colors act as visual chapter markers.
- **Series (not TransitionSeries)** — hard cuts read as intentional editing and
  keep the total duration equal to the sum in the segment table (no overlap
  math). Swap to `TransitionSeries` in `MainVideo.tsx` if you want crossfades.

## Files

```
remotion/
├── package.json
├── tsconfig.json
├── scripts/
│   ├── render.mjs      # Playwright-driven Remotion → MP4
│   └── to-gif.mjs      # ffmpeg two-pass palette → GIF
├── public/shots/       # captured app screenshots (input assets)
├── src/
│   ├── index.ts        # registerRoot
│   ├── Root.tsx        # <Composition id="main" />
│   ├── MainVideo.tsx   # <Series> of scenes
│   ├── segments.ts     # 👈 EDIT THIS to change the video
│   └── scenes/Scene.tsx
└── out/                # generated MP4 + GIF (gitignored)
```
