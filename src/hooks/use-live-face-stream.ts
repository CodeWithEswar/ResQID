"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { configuration } from "@/lib/config";
import { supabase } from "@/lib/supabase";
import type { LiveFaceDetection } from "@/lib/types";

export function useLiveFaceStream() {
  const [status, setStatus] = useState<
    "idle" | "connecting" | "connected" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [detection, setDetection] = useState<LiveFaceDetection | null>(null);
  const [intervalMs, setIntervalMs] = useState(1000);
  const socket = useRef<WebSocket | null>(null);
  const pending = useRef(false);
  const ready = useRef(false);
  const sequence = useRef(0);
  const generation = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const disconnect = useCallback(() => {
    generation.current += 1;
    ready.current = false;
    pending.current = false;
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = null;
    const previous = socket.current;
    socket.current = null;
    if (previous) {
      previous.onclose = null;
      previous.onmessage = null;
      previous.onerror = null;
      previous.close();
    }
    setStatus("idle");
  }, []);

  const connect = useCallback(async () => {
    disconnect();
    setStatus("connecting");
    setError("");
    setDetection(null);
    const run = generation.current;
    try {
      if (!supabase) throw new Error("Complete the app configuration first.");
      const { data, error: authError } = await supabase.auth.getSession();
      if (authError || !data.session) throw new Error("Please sign in again.");
      if (run !== generation.current) return;
      const connection = new WebSocket(
        configuration.apiUrl.replace(/^http/, "ws") + "/api/faces/stream",
      );
      socket.current = connection;
      const fail = (message: string) => {
        if (run !== generation.current) return;
        disconnect();
        setError(message);
        setStatus("error");
      };
      timeout.current = setTimeout(
        () =>
          fail(
            "The live service did not respond. Check that the updated backend and Redis are running.",
          ),
        20000,
      );
      connection.onopen = () => {
        if (run === generation.current)
          connection.send(
            JSON.stringify({ type: "auth", token: data.session!.access_token }),
          );
      };
      connection.onmessage = (event) => {
        if (run !== generation.current) return;
        let message;
        try {
          message = JSON.parse(String(event.data));
        } catch {
          fail("The live service returned an invalid response.");
          return;
        }
        if (timeout.current) clearTimeout(timeout.current);
        timeout.current = null;
        if (message.type === "ready") {
          ready.current = true;
          pending.current = false;
          sequence.current = 0;
          setIntervalMs(
            Math.max(1000, Number(message.min_interval_ms) || 1000),
          );
          setStatus("connected");
        } else if (message.type === "detection") {
          pending.current = false;
          setError("");
          setDetection(message as LiveFaceDetection);
        } else if (message.type === "error") {
          pending.current = false;
          if (message.status === 429)
            setIntervalMs(
              Math.max(1000, Number(message.retry_after_ms) || 1000),
            );
          else if ([401, 403, 409, 503].includes(message.status))
            fail(message.message || "The live session stopped.");
          else
            setError(
              message.message || "This camera frame could not be analyzed.",
            );
        }
      };
      connection.onerror = () =>
        fail(
          "Could not connect to live detection. Check your connection and server address.",
        );
      connection.onclose = (event) =>
        fail(
          event.code === 1000
            ? "The live session ended. Start the camera again to continue."
            : "The live connection closed. Start the camera again to reconnect.",
        );
    } catch (e) {
      if (run === generation.current) {
        setError((e as Error).message);
        setStatus("error");
      }
    }
  }, [disconnect]);

  const canSend = useCallback(
    () =>
      ready.current &&
      !pending.current &&
      socket.current?.readyState === WebSocket.OPEN,
    [],
  );
  const closeConnection = useCallback(() => {
    socket.current?.close(1000);
  }, []);
  const sendFrame = useCallback(
    (imageBase64: string) => {
      if (
        !ready.current ||
        pending.current ||
        socket.current?.readyState !== WebSocket.OPEN
      )
        return false;
      pending.current = true;
      const run = generation.current;
      try {
        socket.current.send(
          JSON.stringify({
            type: "frame",
            sequence: sequence.current++,
            captured_at_ms: Date.now(),
            image_base64: imageBase64,
          }),
        );
      } catch {
        disconnect();
        setStatus("error");
        setError("The camera frame could not be sent. Reconnect to continue.");
        return false;
      }
      timeout.current = setTimeout(() => {
        if (run === generation.current) {
          disconnect();
          setStatus("error");
          setError("Live detection took too long. Reconnect to continue.");
        }
      }, 20000);
      return true;
    },
    [disconnect],
  );

  useEffect(
    () => () => {
      generation.current += 1;
      if (timeout.current) clearTimeout(timeout.current);
      socket.current?.close();
    },
    [],
  );
  return {
    status,
    error,
    detection,
    intervalMs,
    connect,
    disconnect,
    closeConnection,
    canSend,
    sendFrame,
  };
}
