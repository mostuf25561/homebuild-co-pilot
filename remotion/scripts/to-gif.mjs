// Convert the rendered MP4 into a compact GIF for README embedding.
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IN = path.resolve(__dirname, "../out/demo.mp4");
const PALETTE = path.resolve(__dirname, "../out/palette.png");
const OUT = path.resolve(__dirname, "../out/demo.gif");

const FPS = 12;
const WIDTH = 900;

execSync(
  `ffmpeg -y -i "${IN}" -vf "fps=${FPS},scale=${WIDTH}:-1:flags=lanczos,palettegen=stats_mode=diff" "${PALETTE}"`,
  { stdio: "inherit" },
);
execSync(
  `ffmpeg -y -i "${IN}" -i "${PALETTE}" -filter_complex "fps=${FPS},scale=${WIDTH}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" "${OUT}"`,
  { stdio: "inherit" },
);
console.log("gif at", OUT);
