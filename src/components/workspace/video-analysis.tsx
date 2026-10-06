"use client";

import { useEffect, useRef, useState } from "react";
import {
  Alert01Icon,
  Camera01Icon,
  Image01Icon,
  PlayIcon,
  ReplayIcon,
  Tick02Icon,
  Upload01Icon,
  Video01Icon,
} from "hugeicons-react";
import { Badge } from "@/components/ui/badge";
import type { VideoFaceDetection } from "@/lib/types";
import { frameSummary, videoTime } from "@/lib/video-analysis";
import styles from "./video-analysis.module.css";

type VideoAnalysisProps = {
  file: File;
  clip: VideoFaceDetection | null;
  selected: number | null;
  busy: boolean;
  onSelect: (index: number) => void;
  onReupload: () => void;
  onRetake: () => void;
  onReset: () => void;
};

export function VideoAnalysis({
  file, clip, selected, busy, onSelect, onReupload, onRetake, onReset,
}: VideoAnalysisProps) {
  const video = useRef<HTMLVideoElement>(null);
  const [playbackError, setPlaybackError] = useState("");
  const [filter, setFilter] = useState<"all" | "suitable" | "retake">("all");
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const player = video.current;
    if (!player) return;
    const source = URL.createObjectURL(file);
    player.src = source;
    player.load();
    return () => {
      player.pause();
      player.removeAttribute("src");
      player.load();
      URL.revokeObjectURL(source);
    };
  }, [file]);

  function seek(seconds: number) {
    const player = video.current;
    if (!player || player.readyState < 1) return;
    player.pause();
    player.currentTime = Math.min(seconds, player.duration || seconds);
  }
  const chosen = selected === null ? null : clip?.frames[selected];
  const visible = clip?.frames.map((frame, index) => ({ frame, index, summary: frameSummary(frame) }))
    .filter(({ summary }) => filter === "all" || (filter === "suitable" ? summary.suitable : !summary.suitable)) ?? [];
  const suitable = clip?.frames.filter((frame) => frameSummary(frame).suitable).length ?? 0;

  return (
    <section className={styles.analysis} aria-label="Video preview and detected frames">
      <div className={styles.fileHeader}>
        <span className={styles.fileIcon}><Video01Icon size={21} aria-hidden="true" /></span>
        <div><strong>{file.name}</strong><small>{(file.size / (1024 * 1024)).toFixed(1)} MB · Uploaded video</small></div>
        <div className={styles.fileActions}>
          <button type="button" disabled={busy} onClick={onRetake} title="Record a new clip on supported mobile devices, or choose a replacement"><Camera01Icon size={15} aria-hidden="true" /> Retake</button>
          <button type="button" disabled={busy} onClick={onReupload}><Upload01Icon size={15} aria-hidden="true" /> Re-upload</button>
          <button type="button" onClick={onReset}>Start over</button>
        </div>
      </div>

      <div className={styles.playerShell}>
        <div className={styles.playerHeader}><span><PlayIcon size={14} aria-hidden="true" /> Video preview</span><Badge variant={clip ? "success" : "secondary"} dot>{clip ? "Analyzed" : busy ? "Analyzing" : "Uploaded"}</Badge></div>
        <video ref={video} className={styles.player} controls playsInline preload="metadata" aria-label="Uploaded video preview" onLoadedMetadata={(event) => {
          setDuration(Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0);
          setPlaybackError("");
        }} onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)} onError={() => setPlaybackError("Your browser cannot play this codec. You can still inspect detected frames below, or re-upload an MP4 with H.264 video.")} />
        <div className={styles.playerFooter}>
          <span>{videoTime(position)} <small>/ {videoTime(clip?.duration_seconds || duration)}</small></span>
          <div><button type="button" aria-label="Restart video" title="Restart video" onClick={() => seek(0)}><ReplayIcon size={17} /></button><button type="button" disabled={!chosen} onClick={() => chosen && seek(chosen.timestamp_seconds)}>Jump to selected frame</button></div>
        </div>
      </div>
      {playbackError && <p className={styles.warning} role="alert"><Alert01Icon size={16} aria-hidden="true" />{playbackError}</p>}

      {clip && (
        <>
          <div className={styles.stats}>
            <div><span>Clip duration</span><strong>{videoTime(clip.duration_seconds)}</strong></div>
            <div><span>Frames sampled</span><strong>{clip.sampled_frames}</strong></div>
            <div><span>With faces</span><strong>{clip.frames_with_faces}</strong></div>
            <div><span>Suitable previews</span><strong>{suitable}<small> / {clip.frames.length}</small></strong></div>
          </div>
          <div className={styles.framesHeading}><div><p>FRAME SHORTLIST</p><h3>Detected frames <span>{clip.frames.length}</span></h3></div><span>Select a frame, then choose a face.</span></div>
          <div className={styles.filters} aria-label="Filter detected frames">
            {([{ id: "all", label: "All frames", count: clip.frames.length }, { id: "suitable", label: "Suitable", count: suitable }, { id: "retake", label: "Needs retake", count: clip.frames.length - suitable }] as const).map((item) => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}<span>{item.count}</span></button>)}
          </div>
          <p className={styles.explanation}>Showing {clip.frames.length} shortlisted previews from {clip.sampled_frames} sampled frames. Suitable means at least one face passed the quality checks. Detection scores describe face detection, not identity matches.</p>
          <div className={styles.frameGrid}>
            {visible.map(({ frame, index, summary }) => (
              <button key={frame.frame_index} type="button" className={styles.frameCard} disabled={busy || !frame.frame} aria-pressed={selected === index} aria-label={`Inspect frame at ${videoTime(frame.timestamp_seconds)}: ${summary.suitable ? "suitable" : "needs retake"}`} onClick={() => { seek(frame.timestamp_seconds); onSelect(index); }}>
                <div className={styles.frameImage}>
                  {frame.frame ? <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={frame.frame.annotated_image} alt={`Detected faces at ${videoTime(frame.timestamp_seconds)}`} />
                  </> : <Image01Icon size={25} aria-hidden="true" />}
                  <span className={styles.timestamp}>{videoTime(frame.timestamp_seconds)}</span>
                  {selected === index && <span className={styles.selectedMark}><Tick02Icon size={15} /></span>}
                </div>
                <div className={styles.frameCopy}>
                  <Badge variant={summary.suitable ? "success" : "warning"} dot>{summary.suitable ? "Suitable" : "Needs retake"}</Badge>
                  <strong>{summary.usableCount} usable / {frame.faces.length} {frame.faces.length === 1 ? "face" : "faces"}</strong>
                  <div><span>Detection score</span><b>{summary.confidence === null ? "—" : summary.confidence.toFixed(3)}</b></div>
                  <small>{summary.suitable ? "Inspect & choose a face" : "Inspect quality issues"}</small>
                </div>
              </button>
            ))}
          </div>
          {!visible.length && <div className={styles.emptyFrames}><Image01Icon size={25} aria-hidden="true" /><strong>{clip.frames.length ? "No frames match this filter." : "No faces found in the sampled frames."}</strong><p>{clip.frames.length ? "Choose another filter to browse the frame shortlist." : "Retake a closer, well-lit clip or upload another video."}</p>{clip.frames.length > 0 && <button type="button" onClick={() => setFilter("all")}>Show all frames</button>}</div>}
          {chosen && <div className={styles.frameDetail}>
            <div className={styles.detailHeading}><span>Selected frame</span><strong>{videoTime(chosen.timestamp_seconds)}</strong><Badge variant={frameSummary(chosen).suitable ? "success" : "warning"}>{frameSummary(chosen).suitable ? "Ready to inspect" : "Needs retake"}</Badge></div>
            <p>{frameSummary(chosen).suitable ? "Choose one usable face in the image below to continue." : "No face in this frame passed the quality checks. Choose a suitable frame or retake the video."}</p>
            <details><summary>Face scores & quality checks</summary><div className={styles.faceDetails}>{chosen.faces.map((face) => <div key={face.index}><div><strong>Face {face.index + 1}</strong><span>{face.usable ? "Suitable" : "Not suitable"} · Detection {Number.isFinite(face.confidence) ? face.confidence.toFixed(3) : "—"}</span></div>{face.issues.length > 0 && <p>{face.issues.join(" ")}</p>}{face.quality && <small>Face size {face.quality.face_width} × {face.quality.face_height} px · Sharpness {face.quality.laplacian_variance.toFixed(1)} · Brightness {face.quality.brightness.toFixed(2)} · Contrast {face.quality.contrast.toFixed(2)}</small>}</div>)}</div></details>
          </div>}
          {clip.warnings.map((warning) => <p key={warning} className={styles.warning}><Alert01Icon size={16} aria-hidden="true" />{warning}</p>)}
        </>
      )}
    </section>
  );
}
