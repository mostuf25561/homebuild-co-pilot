// SEGMENT ↔ TEXT OVERLAY MAP — edit this to change the video.
// Each entry becomes one scene. `durationInFrames` at 30fps.
// `shot` is the file under public/shots/.
// `title` is the big overlay; `subtitle` is the small line.

export type Segment = {
  id: string;
  shot: string; // filename under public/shots
  title: string;
  subtitle: string;
  durationInFrames: number;
  accent: string; // hex
};

export const FPS = 30;
export const WIDTH = 1280;
export const HEIGHT = 720;

export const SEGMENTS: Segment[] = [
  {
    id: "intro",
    shot: "copilot.png",
    title: "Goal Co-Pilot",
    subtitle: "An ADHD-friendly framework for owner-driven projects",
    durationInFrames: 90,
    accent: "#B4531A",
  },
  {
    id: "today",
    shot: "today.png",
    title: "Plan your day",
    subtitle: "Free-text intent + drag-reorderable tasks due today",
    durationInFrames: 90,
    accent: "#3B82F6",
  },
  {
    id: "objectives",
    shot: "objectives.png",
    title: "Objectives & tasks",
    subtitle: "Color-coded, sub-tasked, typed relations",
    durationInFrames: 90,
    accent: "#10B981",
  },
  {
    id: "categories",
    shot: "categories.png",
    title: "See where focus goes",
    subtitle: "Click a slice to jump to that category",
    durationInFrames: 80,
    accent: "#F59E0B",
  },
  {
    id: "graph",
    shot: "graph.png",
    title: "Editable task map",
    subtitle: "Right-click nodes · edit edges · chrono lane mode",
    durationInFrames: 90,
    accent: "#8B5CF6",
  },
  {
    id: "mantras",
    shot: "mantras.png",
    title: "Ground yourself",
    subtitle: "Mantras + full-screen breathing overlay",
    durationInFrames: 80,
    accent: "#EC4899",
  },
  {
    id: "plugins",
    shot: "plugins.png",
    title: "Swap the whole domain",
    subtitle: "Plugins = JSON bundles you can share",
    durationInFrames: 90,
    accent: "#0EA5E9",
  },
  {
    id: "outro",
    shot: "copilot.png",
    title: "Local-first. Yours.",
    subtitle: "Everything stays in your browser",
    durationInFrames: 70,
    accent: "#B4531A",
  },
];

export const TOTAL_FRAMES = SEGMENTS.reduce((a, s) => a + s.durationInFrames, 0);
