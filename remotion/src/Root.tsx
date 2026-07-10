import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";
import { FPS, WIDTH, HEIGHT, TOTAL_FRAMES } from "./segments";

export const RemotionRoot = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
