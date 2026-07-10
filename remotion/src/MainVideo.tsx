import { AbsoluteFill, Series } from "remotion";
import { SEGMENTS } from "./segments";
import { Scene } from "./scenes/Scene";

export const MainVideo = () => {
  return (
    <AbsoluteFill style={{ background: "#0F0B08" }}>
      <Series>
        {SEGMENTS.map((seg) => (
          <Series.Sequence key={seg.id} durationInFrames={seg.durationInFrames}>
            <Scene seg={seg} />
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
