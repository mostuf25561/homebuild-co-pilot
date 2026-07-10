import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Segment } from "../segments";

export const Scene: React.FC<{ seg: Segment }> = ({ seg }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Ken Burns: slow zoom-in on shot
  const kb = interpolate(frame, [0, durationInFrames], [1.04, 1.12]);
  const shotFade = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: "clamp",
  });
  const shotOut = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" },
  );

  // Overlay bar slides up from bottom
  const barIn = spring({ frame: frame - 6, fps, config: { damping: 18, stiffness: 140 } });
  const barY = interpolate(barIn, [0, 1], [80, 0]);
  const barOpacity = interpolate(barIn, [0, 1], [0, 1]);

  // Title typewriter-ish reveal via clip-path
  const titleReveal = spring({
    frame: frame - 14,
    fps,
    config: { damping: 22, stiffness: 120 },
  });
  const titleClip = interpolate(titleReveal, [0, 1], [0, 100]);

  const subReveal = interpolate(frame, [22, 40], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#0F0B08" }}>
      {/* Screenshot with vignette + Ken Burns */}
      <AbsoluteFill
        style={{
          opacity: shotFade * shotOut,
          transform: `scale(${kb})`,
        }}
      >
        <Img
          src={staticFile(`shots/${seg.shot}`)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top",
          }}
        />
        {/* Bottom gradient for text legibility */}
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(to top, rgba(15,11,8,0.92) 0%, rgba(15,11,8,0.55) 30%, rgba(15,11,8,0) 55%)",
          }}
        />
      </AbsoluteFill>

      {/* Accent bar */}
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          padding: "0 64px 56px 64px",
          transform: `translateY(${barY}px)`,
          opacity: barOpacity,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 6,
              height: 92,
              background: seg.accent,
              borderRadius: 3,
              boxShadow: `0 0 24px ${seg.accent}55`,
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "sans-serif",
                fontWeight: 800,
                fontSize: 56,
                color: "white",
                letterSpacing: -1,
                lineHeight: 1.05,
                clipPath: `inset(0 ${100 - titleClip}% 0 0)`,
              }}
            >
              {seg.title}
            </div>
            <div
              style={{
                fontFamily: "sans-serif",
                fontWeight: 400,
                fontSize: 24,
                color: "rgba(255,255,255,0.78)",
                marginTop: 12,
                opacity: subReveal,
                transform: `translateY(${(1 - subReveal) * 10}px)`,
              }}
            >
              {seg.subtitle}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
