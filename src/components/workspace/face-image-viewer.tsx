"use client";

import { useEffect, useRef, useState } from "react";
import { Image01Icon, Maximize01Icon, RefreshIcon, ViewIcon, ViewOffIcon, ZoomInAreaIcon, ZoomOutAreaIcon } from "hugeicons-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { DetectedFace, FaceDetection } from "@/lib/types";
import styles from "./face-search.module.css";

type ViewerProps = { detection: FaceDetection; selected: number | null; onSelect: (index: number) => void; disabled: boolean };

function FaceThumbnail({
  face,
  detection,
  size = 46,
}: {
  face: DetectedFace;
  detection: FaceDetection;
  size?: number;
}) {
  const [loadError, setLoadError] = useState(false);
  const imageSrc = detection.frame?.image || detection.frame?.annotated_image;
  const width = Math.max(1, detection.width || detection.frame?.width || 1);
  const height = Math.max(1, detection.height || detection.frame?.height || 1);

  const b0 = typeof face.box?.[0] === "number" ? face.box[0] : 0;
  const b1 = typeof face.box?.[1] === "number" ? face.box[1] : 0;
  const b2 = typeof face.box?.[2] === "number" ? face.box[2] : width;
  const b3 = typeof face.box?.[3] === "number" ? face.box[3] : height;

  const boxW = Math.max(1, b2 - b0);
  const boxH = Math.max(1, b3 - b1);
  const side = Math.min(
    Math.max(boxW, boxH) * 1.35,
    width,
    height,
  );
  const left = Math.max(
    0,
    Math.min(width - side, (b0 + b2 - side) / 2),
  );
  const top = Math.max(
    0,
    Math.min(height - side, (b1 + b3 - side) / 2),
  );
  const scale = size / Math.max(1, side);

  if (!imageSrc || loadError) {
    return <span className={styles.faceNumber}>{face.index + 1}</span>;
  }

  return (
    <div
      className={styles.faceThumbnail}
      style={{
        width: size,
        height: size,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt={`Detected face ${face.index + 1}`}
        draggable={false}
        onError={() => setLoadError(true)}
        style={{
          position: "absolute",
          left: -left * scale,
          top: -top * scale,
          width: width * scale,
          height: height * scale,
          maxWidth: "none",
          maxHeight: "none",
          display: "block",
          objectFit: "fill",
        }}
      />
      <span className={styles.faceThumbnailBadge}>{face.index + 1}</span>
    </div>
  );
}

function ImageCanvas({ detection, selected, onSelect, disabled, zoom, boxes }: ViewerProps & { zoom: number; boxes: boolean }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const ratio = detection.width / Math.max(1, detection.height);
  const containerW =
    size.width ||
    (typeof window !== "undefined"
      ? Math.min(640, Math.max(280, window.innerWidth - 64))
      : 320);
  const containerH =
    size.height || Math.min(360, Math.round(containerW * 0.65));
  const width = Math.min(containerW, containerH * ratio) * zoom;
  const height = width / ratio;
  return (
    <div ref={viewport} className={styles.imageViewport} tabIndex={0} aria-label="Image preview. Scroll to pan when zoomed.">
      <div className={styles.imageCanvas} style={{ width: Math.max(size.width, width), height: Math.max(size.height, height) }}>
        <div className={styles.imageLayer} style={{ width, height }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={detection.frame!.image} alt="Uploaded image with detected faces" draggable={false} />
          {boxes && detection.faces.map(face => (
            <button key={face.index} className={`face-box ${face.index === selected ? "selected" : ""}`} aria-label={`Select face ${face.index + 1}${face.usable ? "" : `: ${face.issues.join(", ")}`}`} aria-pressed={selected === face.index} disabled={disabled || !face.usable} onClick={() => onSelect(face.index)} style={{ left: `${face.box[0] / detection.width * 100}%`, top: `${face.box[1] / detection.height * 100}%`, width: `${(face.box[2] - face.box[0]) / detection.width * 100}%`, height: `${(face.box[3] - face.box[1]) / detection.height * 100}%` }}>
              <span>{face.index + 1}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Viewer({ expanded = false, ...props }: ViewerProps & { expanded?: boolean }) {
  const [zoom, setZoom] = useState(1);
  const [boxes, setBoxes] = useState(true);
  return (
    <div className={`${styles.viewer} ${expanded ? styles.expandedViewer : ""}`}>
      <div className={styles.viewerHeading}><span><Image01Icon size={16} aria-hidden="true" /> Image preview</span><small>{props.detection.width} × {props.detection.height}</small></div>
      <ImageCanvas {...props} zoom={zoom} boxes={boxes} />
      <div className={styles.imageToolbar} aria-label="Image controls">
        <div className={styles.controlGroup}>
          <button type="button" aria-label="Zoom out" title="Zoom out" disabled={zoom <= 1} onClick={() => setZoom(value => Math.max(1, value - .25))}><ZoomOutAreaIcon size={18} /></button>
          <output aria-label="Image zoom">{Math.round(zoom * 100)}%</output>
          <button type="button" aria-label="Zoom in" title="Zoom in" disabled={zoom >= 3} onClick={() => setZoom(value => Math.min(3, value + .25))}><ZoomInAreaIcon size={18} /></button>
          <button type="button" aria-label="Fit image" title="Fit image" onClick={() => setZoom(1)}><RefreshIcon size={17} /></button>
        </div>
        <div className={styles.controlGroup}>
          <button type="button" aria-label={boxes ? "Hide face boxes" : "Show face boxes"} aria-pressed={boxes} title={boxes ? "Hide face boxes" : "Show face boxes"} onClick={() => setBoxes(value => !value)}>{boxes ? <ViewIcon size={18} /> : <ViewOffIcon size={18} />}</button>
          {!expanded && <Dialog><DialogTrigger asChild><button type="button" aria-label="Expand image" title="Expand image"><Maximize01Icon size={18} /></button></DialogTrigger><DialogContent className="max-w-5xl p-4 sm:p-6"><DialogTitle className="pr-10 text-lg font-semibold">Inspect the image</DialogTitle><DialogDescription className="mt-1 mb-4 text-sm text-zinc-400">Zoom in, pan, and select the person you intend to search.</DialogDescription><Viewer {...props} expanded /></DialogContent></Dialog>}
        </div>
      </div>
    </div>
  );
}

export function DetectionPreview(props: ViewerProps) {
  if (!props.detection.frame) return null;
  return (
    <div className={styles.detection}>
      <Viewer key={props.detection.frame.image} {...props} />
      <div className={styles.selectionHeading}>
        <strong>Choose a face</strong>
        <span>
          {props.detection.faces.filter((face) => face.usable).length} usable /{" "}
          {props.detection.faces.length} detected
        </span>
      </div>
      <div className={styles.faceOptions}>
        {props.detection.faces.map((face) => (
          <button
            key={face.index}
            disabled={props.disabled || !face.usable}
            aria-pressed={props.selected === face.index}
            onClick={() => props.onSelect(face.index)}
            title={face.issues.join(", ")}
          >
            <FaceThumbnail face={face} detection={props.detection} />
            <div className={styles.faceMeta}>
              <div className="flex items-center gap-1.5">
                <strong className={styles.faceTitle}>Face {face.index + 1}</strong>
                {typeof face.confidence === "number" && (
                  <span className={styles.faceConfidence}>
                    {Math.round(face.confidence * 100)}%
                  </span>
                )}
              </div>
              <small className={styles.faceStatus}>
                {face.usable
                  ? props.selected === face.index
                    ? "Selected"
                    : "Ready to select"
                  : face.issues[0] || "Poor quality"}
              </small>
            </div>
          </button>
        ))}
      </div>
      <p className={styles.selectionNote}>
        {props.detection.faces.length
          ? "Only the selected face is used for your search."
          : "No faces detected. Try a clearer photograph."}
      </p>
    </div>
  );
}
