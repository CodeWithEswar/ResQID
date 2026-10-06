"use client";
import { useCallback, useEffect, useRef, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import {
  Camera01Icon,
  Image01Icon,
  Video01Icon,
  Upload01Icon,
  Shield01Icon,
  Search01Icon,
} from "hugeicons-react";
import { api } from "@/lib/api";
import type {
  FaceDetection,
  SearchResult,
  VideoFaceDetection,
} from "@/lib/types";
import { useLiveFaceStream } from "@/hooks/use-live-face-stream";
import {
  Artwork,
  ErrorMessage,
  Loading,
  PageHeading,
} from "./shared";
import { DetectionPreview } from "./face-image-viewer";
import { SearchResults } from "./search-results";
import { SearchGuideCarousel } from "./search-guide-carousel";
import { VideoAnalysis } from "./video-analysis";
import styles from "./face-search.module.css";

async function frameFile(uri: string) {
  const response = await fetch(uri);
  return new File([await response.blob()], "camera-frame.jpg", {
    type: "image/jpeg",
  });
}
function BrowserCamera({
  onCapture,
  disabled,
}: {
  onCapture: (file: File) => Promise<void>;
  disabled: boolean;
}) {
  const live = useLiveFaceStream();
  const { connect, disconnect, canSend, sendFrame, status, intervalMs } = live;
  const video = useRef<HTMLVideoElement>(null);
  const media = useRef<MediaStream | null>(null);
  const generation = useRef(0);
  const [cameraError, setCameraError] = useState("");
  const [starting, setStarting] = useState(false);
  const stop = useCallback(() => {
    generation.current++;
    media.current?.getTracks().forEach((track) => track.stop());
    media.current = null;
    if (video.current) video.current.srcObject = null;
    disconnect();
  }, [disconnect]);
  useEffect(() => {
    const hide = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      stop();
    };
  }, [stop]);
  useEffect(() => {
    if (status === "error") {
      media.current?.getTracks().forEach((track) => track.stop());
      media.current = null;
    }
  }, [status]);
  useEffect(() => {
    if (status !== "connected") return;
    const timer = setInterval(() => {
      const source = video.current;
      if (!source || source.readyState < 2 || !canSend()) return;
      const canvas = document.createElement("canvas");
      const ratio = Math.min(
        1,
        1280 / Math.max(source.videoWidth, source.videoHeight),
      );
      canvas.width = Math.round(source.videoWidth * ratio);
      canvas.height = Math.round(source.videoHeight * ratio);
      canvas
        .getContext("2d")
        ?.drawImage(source, 0, 0, canvas.width, canvas.height);
      sendFrame(canvas.toDataURL("image/jpeg", 0.75).split(",")[1]);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [status, intervalMs, canSend, sendFrame]);
  async function start() {
    stop();
    const run = generation.current;
    setStarting(true);
    setCameraError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error(
          "Camera access requires HTTPS or localhost. You can upload a photo instead.",
        );
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 } },
        audio: false,
      });
      if (run !== generation.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      media.current = stream;
      if (video.current) {
        video.current.srcObject = stream;
        await video.current.play();
      }
      if (run === generation.current) await connect();
    } catch (e) {
      if (run === generation.current) {
        setCameraError((e as Error).message);
        stop();
      }
    } finally {
      if (run === generation.current || !media.current) setStarting(false);
    }
  }
  async function freeze() {
    const uri = live.detection?.frame?.image;
    if (!uri) return;
    stop();
    try { await onCapture(await frameFile(uri)); }
    catch (e) { setCameraError((e as Error).message); }
  }
  return (
    <div className={styles.cameraState}>
      <video
        ref={video}
        className="media-preview"
        autoPlay
        muted
        playsInline
        aria-label="Live camera preview"
        style={{
          display:
            ["connecting", "connected"].includes(status) || starting
              ? "block"
              : "none",
        }}
      />
      {live.detection?.frame && status === "connected" && (
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="media-preview"
            src={live.detection.frame.annotated_image}
            alt="Latest analyzed camera frame with detected faces."
          />
          <p className="muted" style={{ fontSize: 12, marginTop: 8 }}>
            {live.detection.faces.length} detected faces ·{" "}
            {live.detection.processing_ms ?? "—"} ms
          </p>
        </div>
      )}
      <ErrorMessage error={cameraError || live.error} />
      {!["connecting", "connected"].includes(status) && !starting ? (
        <div className={styles.dropZone} data-mode="live">
          <Artwork name="search/live" className={styles.uploadArtwork} />
          <h3>A clue through your camera.</h3>
          <p>
            Start your camera to detect faces. Freeze a frame before selecting a face to search.
          </p>
          <small>
            Your browser asks for camera permission. Freeze a clear frame before searching.
          </small>
          <button
            className={`btn ${styles.btnAction}`}
            disabled={disabled || starting || status === "connecting"}
            onClick={() => void start()}
          >
            <Camera01Icon size={16} />
            {starting || status === "connecting"
              ? "Connecting…"
              : "Start camera"}
          </button>
        </div>
      ) : (
        <>
          <div className={styles.cameraActions}>
            <button
              className="btn secondary"
              disabled={disabled || starting || status === "connecting"}
              onClick={() => void stop()}
            >
              <Camera01Icon size={16} />
              Stop camera
            </button>
            <button
              className={`btn ${styles.btnAction}`}
              disabled={
                disabled ||
                status !== "connected" ||
                !live.detection?.faces.some((face) => face.usable)
              }
              onClick={() => void freeze()}
            >
              Use this frame
            </button>
          </div>
          <p className="muted" style={{ fontSize: 11, textAlign: "center" }}>
            Freeze a clear frame before selecting a face to search.
          </p>
        </>
      )}
    </div>
  );
}

export function FaceCapture({
  purpose = "search",
  caseId,
  onEnrolled,
  compact = false,
}: {
  purpose?: "search" | "enroll";
  caseId?: string;
  onEnrolled?: () => void;
  compact?: boolean;
}) {
  const [mode, setMode] = useState<"photo" | "video" | "live">("photo");
  const [file, setFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [detection, setDetection] = useState<FaceDetection | null>(null);
  const [clip, setClip] = useState<VideoFaceDetection | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [frameIndex, setFrameIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [success, setSuccess] = useState("");
  const [dragging, setDragging] = useState(false);
  const upload = useRef<HTMLInputElement>(null);
  const retake = useRef<HTMLInputElement>(null);
  const request = useRef<AbortController | null>(null);
  const revision = useRef(0);
  const client = useQueryClient();
  useEffect(
    () => () => {
      revision.current++;
      request.current?.abort();
    },
    [],
  );
  function reset(nextMode = mode) {
    revision.current++;
    request.current?.abort();
    setMode(nextMode);
    setFile(null);
    setVideoFile(null);
    setDetection(null);
    setClip(null);
    setSelected(null);
    setFrameIndex(null);
    setError("");
    setSuccess("");
    setResult(null);
    setBusy(false);
    setDragging(false);
  }
  async function detect(photo: File) {
    const run = ++revision.current;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    setResult(null);
    setSuccess("");
    setDetection(null);
    setSelected(null);
    setFile(null);
    try {
      if (photo.size > 10 * 1024 * 1024)
        throw new Error("Choose a photo smaller than 10 MB.");
      const form = new FormData();
      form.append("image", photo);
      const response = await api<FaceDetection>("/api/faces/detect", {
        method: "POST",
        body: form,
        signal: controller.signal,
      });
      if (run !== revision.current) return;
      setFile(photo);
      setDetection(response);
      const usable = response.faces.filter((face) => face.usable);
      if (usable.length === 1) setSelected(usable[0].index);
    } catch (e) {
      if (run === revision.current) setError((e as Error).message);
    } finally {
      if (run === revision.current) setBusy(false);
    }
  }
  async function detectVideo(video: File) {
    reset();
    if (video.size > 50 * 1024 * 1024) {
      setError("Choose a video smaller than 50 MB and no longer than 60 seconds.");
      return;
    }
    const run = ++revision.current;
    const controller = new AbortController();
    request.current = controller;
    setVideoFile(video);
    setBusy(true);
    try {
      const form = new FormData();
      form.append("video", video);
      form.append("interval_seconds", "1");
      form.append("max_frames", "20");
      form.append("result_limit", "8");
      const response = await api<VideoFaceDetection>("/api/faces/video", {
        method: "POST",
        body: form,
        signal: controller.signal,
      });
      if (run === revision.current) setClip(response);
    } catch (e) {
      if (run === revision.current) setError((e as Error).message);
    } finally {
      if (run === revision.current) setBusy(false);
    }
  }
  async function chooseFrame(index: number) {
    const frame = clip?.frames[index];
    if (!frame?.frame) return;
    const run = ++revision.current;
    request.current?.abort();
    setBusy(true);
    setError("");
    setDetection(null);
    setSelected(null);
    setResult(null);
    setSuccess("");
    setFrameIndex(index);
    try {
      const image = await frameFile(frame.frame.image);
      if (run !== revision.current) return;
      await detect(image);
    } catch (e) {
      if (run === revision.current) {
        setError((e as Error).message);
        setBusy(false);
      }
    }
  }
  async function submit() {
    if (
      !file ||
      !detection ||
      selected === null ||
      !detection.faces.some((face) => face.index === selected && face.usable)
    )
      return;
    const run = ++revision.current;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    setSuccess("");
    setResult(null);
    try {
      const form = new FormData();
      form.append(purpose === "enroll" ? "image" : "face", file);
      form.append("face_index", String(selected));
      form.append("detector_version", detection.detector_version);
      if (purpose === "enroll") {
        if (!caseId)
          throw new Error("Choose a case before enrolling evidence.");
        form.append("modality", "face");
        await api(`/api/cases/${encodeURIComponent(caseId)}/references`, {
          method: "POST",
          body: form,
          signal: controller.signal,
        });
        if (run === revision.current) {
          setSuccess("Reference photograph enrolled.");
          onEnrolled?.();
        }
      } else {
        const response = await api<SearchResult>("/api/search", {
          method: "POST",
          body: form,
          signal: controller.signal,
        });
        if (run === revision.current) {
          setResult(response);
          await client.invalidateQueries({ queryKey: ["reviews"] });
        }
      }
    } catch (e) {
      if (run === revision.current) setError((e as Error).message);
    } finally {
      if (run === revision.current) setBusy(false);
    }
  }
  return (
    <div className={styles.capture} data-compact={compact}>
      <div className={styles.captureTop}><h2>{purpose === "enroll" ? "Add reference evidence" : "Choose your source"}</h2><span><Shield01Icon size={13} aria-hidden="true" />Your workspace registry</span></div>
      <div className={styles.modes} aria-label="Capture source">
        {(
          [
            { id: "photo", label: "Photo", icon: Image01Icon },
            { id: "video", label: "Video", icon: Video01Icon },
            { id: "live", label: "Live camera", icon: Camera01Icon },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            data-mode={item.id}
            aria-pressed={mode === item.id}
            disabled={busy}
            onClick={() => reset(item.id)}
          >
            <item.icon size={18} aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </div>
      <ErrorMessage error={error} />
      {success && (
        <div className="success-message" role="status">
          {success}
        </div>
      )}
      {mode !== "live" && (
        <>
          <input
            ref={upload}
            type="file"
            hidden
            accept={
              mode === "video"
                ? "video/mp4,video/quicktime,video/webm,video/x-msvideo"
                : "image/jpeg,image/png,image/webp"
            }
            onChange={(event) => {
              const selected = event.target.files?.[0];
              if (selected)
                void (mode === "video"
                  ? detectVideo(selected)
                  : detect(selected));
              event.target.value = "";
            }}
          />
          {mode === "video" && <input ref={retake} type="file" hidden accept="video/*" capture="environment" onChange={(event) => {
            const video = event.target.files?.[0];
            if (video) void detectVideo(video);
            event.target.value = "";
          }} />}
          {!detection && !clip && !busy && !videoFile ? (
            <div
              className={styles.dropZone}
              data-mode={mode}
              data-dragging={dragging}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={(event) => {
                if (
                  !event.currentTarget.contains(
                    event.relatedTarget as Node | null,
                  )
                )
                  setDragging(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                const dropped = event.dataTransfer.files[0];
                if (!dropped) return;
                const allowed =
                  mode === "photo"
                    ? ["image/jpeg", "image/png", "image/webp"]
                    : [
                        "video/mp4",
                        "video/quicktime",
                        "video/webm",
                        "video/x-msvideo",
                        "video/avi",
                      ];
                if (!allowed.includes(dropped.type)) {
                  setError(`Choose a supported ${mode} file.`);
                  return;
                }
                void (mode === "photo"
                  ? detect(dropped)
                  : detectVideo(dropped));
              }}
            >
              <Artwork
                name={mode === "photo" ? "workspace/capture" : "search/video"}
                className={styles.uploadArtwork}
              />
              <h3>
                {mode === "photo"
                  ? "Start with a photograph."
                  : "Find a face in a video."}
              </h3>
              <p>
                {mode === "photo"
                  ? "Drop a photograph here, or choose one from your device."
                  : "Drop a short clip here. Choose a clear frame after detection."}
              </p>
              <small>
                {mode === "photo"
                  ? "JPEG, PNG, or WebP · up to 10 MB"
                  : "MP4, MOV, AVI, or WebM · up to 50 MB / 60 seconds"}
              </small>
              <button
                className={`btn ${styles.btnAction}`}
                onClick={() => upload.current?.click()}
              >
                <Upload01Icon size={16} />
                Choose {mode}
              </button>
            </div>
          ) : mode === "photo" ? (
            <div className={styles.fileBar}>
              <span
                className="muted"
                style={{ fontSize: 12, overflowWrap: "anywhere" }}
              >
                {mode === "photo" ? <Image01Icon size={15} /> : <Video01Icon size={15} />}
                {videoFile?.name || file?.name}
              </span>
              <button
                className="btn secondary small"
                disabled={busy}
                onClick={() => upload.current?.click()}
              >
                Choose another {mode}
              </button>
            </div>
          ) : null}
        </>
      )}
      {mode === "live" && !detection && (
        <BrowserCamera disabled={busy} onCapture={detect} />
      )}
      {mode === "video" && videoFile && <VideoAnalysis
        key={`${videoFile.name}:${videoFile.lastModified}:${videoFile.size}`}
        file={videoFile}
        clip={clip}
        selected={frameIndex}
        busy={busy}
        onSelect={(index) => void chooseFrame(index)}
        onReupload={() => upload.current?.click()}
        onRetake={() => retake.current?.click()}
        onReset={() => reset("video")}
      />}
      {busy && (
        <Loading
          label={
            detection
              ? purpose === "enroll"
                ? "Enrolling reference…"
                : "Searching the case registry…"
              : mode === "video" ? clip ? "Preparing the selected frame…" : "Analyzing the video…" : "Detecting faces…"
          }
        />
      )}
      {detection && (
        <>
          <DetectionPreview
            detection={detection}
            selected={selected}
            disabled={busy}
            onSelect={(index) => {
              setSelected(index);
              setResult(null);
              setSuccess("");
            }}
          />
          <div className={styles.actions}>
            <button
              className="btn"
              disabled={busy || selected === null || Boolean(success)}
              onClick={() => void submit()}
            >
              {purpose === "search" && <Search01Icon size={17} aria-hidden="true" />}
              {purpose === "enroll"
                ? "Enroll selected face"
                : "Search selected face"}
            </button>
            <button className="btn secondary" onClick={() => reset()}>
              {busy ? "Cancel" : "Clear"}
            </button>
          </div>
        </>
      )}
      {busy && !detection && <button className="btn secondary" onClick={() => reset()}>Cancel detection</button>}
      {result && <SearchResults result={result} />}
    </div>
  );
}
export function FaceSearch() {
  return (
    <div className={styles.page}>
      <PageHeading
        eyebrow="FACE SEARCH"
        title="Follow the next clue."
        description="Detect a face, choose the person, and search your team’s reference registry."
      />
      <div className={styles.layout}>
        <section className={styles.capturePanel} aria-label="Face capture and results">
          <FaceCapture />
        </section>
        <aside className={styles.aside}>
          <SearchGuideCarousel />
          <div className={styles.reviewNotice}><Shield01Icon size={19} aria-hidden="true" /><div><strong>People make the final call.</strong><p>Similarity helps your team find possible leads. Every candidate needs an independent review.</p></div></div>
        </aside>
      </div>
    </div>
  );
}
