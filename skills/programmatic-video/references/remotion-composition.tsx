import { Audio } from "@remotion/media";
import { Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import React from "react";

// ============================================================================
// CONFIGURE: Edit slides array with your content and durations
// Durations come from ffprobe after generating TTS audio files.
// ============================================================================
const FPS = 30;

const slides = [
  { id: "title", text: "Ponte", subtitle: "Push-to-talk dictation for macOS", duration: 4.20, orbState: "idle" },
  { id: "press", text: "⌥⌘Space", subtitle: "One hotkey. Any app. The orb appears.", duration: 6.48, orbState: "press" },
  { id: "speak", text: "Talk.", subtitle: "The orb's dots answer your voice.", duration: 4.00, orbState: "speak" },
  { id: "transcribe", text: "It types.", subtitle: "Parakeet on the Neural Engine. 100% local.", duration: 6.04, orbState: "transcribe" },
  { id: "paste", text: "Anywhere.", subtitle: "The transcript drops at your cursor.", duration: 3.40, orbState: "paste" },
];

// Calculate cumulative start frames
const slideStarts: number[] = [];
let cumulative = 0;
for (const slide of slides) {
  slideStarts.push(cumulative);
  cumulative += Math.ceil(slide.duration * FPS);
}
const totalFrames = cumulative;

// ============================================================================
// Orb component (SVG-based, animated per state)
// ============================================================================
const Orb: React.FC<{ state: string; frame: number; fps: number }> = ({ state, frame, fps }) => {
  const t = frame / fps;
  const rings = 8;
  const dotsPerRing = 24;
  const radius = 140;

  let pulse = 0.4;
  let spinSpeed = 0.5;
  if (state === "idle") { pulse = 0.5 + 0.1 * Math.sin(t * 2); spinSpeed = 0.5; }
  else if (state === "press") { pulse = 0.3 + 0.3 * Math.sin(t * 8); spinSpeed = 2; }
  else if (state === "speak") { pulse = 0.4 + 0.4 * Math.sin(t * 6); spinSpeed = 1.5; }
  else if (state === "transcribe") { pulse = 0.35 + 0.15 * Math.sin(t * 3); spinSpeed = 0.8; }
  else if (state === "paste") { pulse = 0.2 + 0.05 * Math.sin(t * 1); spinSpeed = 0.2; }

  const dots: { x: number; y: number; r: number; opacity: number }[] = [];
  for (let ring = 1; ring <= rings; ring++) {
    const rr = (radius * (ring / rings)) * (0.9 + 0.1 * pulse);
    for (let i = 0; i < dotsPerRing; i++) {
      const angle = (i / dotsPerRing) * 2 * Math.PI + t * spinSpeed * (ring % 2 === 0 ? 1 : -1);
      const x = 160 + rr * Math.cos(angle);
      const y = 160 + rr * Math.sin(angle);
      const dotR = Math.max(1, 3 * (1 - ring / (rings + 1)) + 1);
      const opacity = (1 - ring / (rings + 1)) * (0.6 + 0.4 * pulse);
      dots.push({ x, y, r: dotR, opacity });
    }
  }

  return (
    <svg width="320" height="320" viewBox="0 0 320 320">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={`rgba(22, 199, 132, ${d.opacity})`} filter="url(#glow)" />
      ))}
    </svg>
  );
};

// ============================================================================
// Slide component
// ============================================================================
const Slide: React.FC<{ slide: typeof slides[0]; localFrame: number; fps: number }> = ({ slide, localFrame, fps }) => {
  const fadeIn = interpolate(localFrame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(localFrame, [slide.duration * fps - 10, slide.duration * fps], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = Math.min(fadeIn, fadeOut);

  const slideIn = spring({ frame: localFrame, fps, config: { damping: 15, stiffness: 100 } });
  const translateY = interpolate(slideIn, [0, 1], [40, 0]);

  return (
    <div style={{
      width: "100%", height: "100%", display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "0 80px", opacity,
      background: "radial-gradient(circle at 70% 50%, rgba(22,199,132,0.06) 0%, transparent 50%)",
    }}>
      <div style={{ transform: `translateY(${translateY}px)`, maxWidth: 500 }}>
        <div style={{ fontFamily: "monospace", fontSize: 14, color: "#16c784", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>
          {slide.id === "title" ? "Ponte" : `${slides.indexOf(slide) + 1} — ${slide.id.charAt(0).toUpperCase() + slide.id.slice(1)}`}
        </div>
        <div style={{ fontSize: slide.id === "title" ? 96 : 64, fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 0.9, marginBottom: 24, color: "#fff" }}>
          {slide.text}
        </div>
        <div style={{ fontSize: 20, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
          {slide.subtitle}
        </div>
      </div>
      <div style={{ filter: "drop-shadow(0 0 60px rgba(22,199,132,0.3))" }}>
        <Orb state={slide.orbState} frame={localFrame} fps={fps} />
      </div>
    </div>
  );
};

// ============================================================================
// Main composition
// ============================================================================
export const MyComponent: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#000", position: "relative" }}>
      {slides.map((slide, i) => {
        const start = slideStarts[i];
        const dur = Math.ceil(slide.duration * FPS);
        return (
          <Sequence key={slide.id} from={start} durationInFrames={dur}>
            <Slide slide={slide} localFrame={frame - start} fps={fps} />
            <Audio src={staticFile(`audio/${slide.id}.wav`)} />
          </Sequence>
        );
      })}

      {/* Progress bar */}
      <div style={{ position: "absolute", bottom: 40, left: 80, right: 80, height: 3, backgroundColor: "rgba(255,255,255,0.1)" }}>
        <div style={{ height: "100%", width: `${(frame / totalFrames) * 100}%`, backgroundColor: "#16c784" }} />
      </div>

      {/* Branding */}
      <div style={{ position: "absolute", top: 40, left: 80, fontFamily: "monospace", fontSize: 14, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
        PONTE
      </div>
    </div>
  );
};

export const calculateMetadata = () => {
  return { durationInFrames: totalFrames, fps: FPS };
};
