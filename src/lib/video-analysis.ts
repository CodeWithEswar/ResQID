import type { VideoFaceFrame } from "./types";

export function frameSummary(frame: VideoFaceFrame) {
  const usable = frame.faces.filter((face) => face.usable);
  // A rejected face's high detection confidence must not make a frame suitable.
  const scored = usable.length ? usable : frame.faces;
  const confidences = scored.map((face) => face.confidence).filter(Number.isFinite);
  return {
    usableCount: usable.length,
    suitable: usable.length > 0,
    confidence: confidences.length ? Math.max(0, Math.min(1, Math.max(...confidences))) : null,
    issues: [...new Set(frame.faces.filter((face) => !face.usable).flatMap((face) => face.issues))],
  };
}

export function videoTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00.0";
  const tenths = Math.round(seconds * 10);
  return `${Math.floor(tenths / 600)}:${String(Math.floor(tenths / 10) % 60).padStart(2, "0")}.${tenths % 10}`;
}
