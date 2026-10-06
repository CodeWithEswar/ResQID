"use client";
import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ErrorMessage } from "./shared";

export function EarEvidence({ caseId }: { caseId: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const client = useQueryClient();
  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Choose an evidence photograph.");
      if (file.size > 10 * 1024 * 1024)
        throw new Error("Choose a photo smaller than 10 MB.");
      const form = new FormData();
      form.append("image", file);
      form.append("modality", "ear");
      return api(`/api/cases/${encodeURIComponent(caseId)}/references`, {
        method: "POST",
        body: form,
      });
    },
    onSuccess: async () => {
      setSuccess(true);
      setFile(null);
      await client.invalidateQueries({ queryKey: ["case"] });
    },
  });
  return (
    <section className="panel form-stack">
      <h2>Additional ear evidence</h2>
      <p className="muted" style={{ fontSize: 13 }}>
        Store an ear photograph for human inspection. Ear evidence is excluded
        from identity ranking.
      </p>
      <input
        ref={input}
        type="file"
        hidden
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => {
          setFile(event.target.files?.[0] || null);
          setSuccess(false);
          upload.reset();
          event.target.value = "";
        }}
      />
      <ErrorMessage error={upload.error} />
      {success && (
        <div className="success-message" role="status">
          Evidence photograph saved.
        </div>
      )}
      <div className="row">
        <button
          className="btn secondary"
          disabled={upload.isPending}
          onClick={() => input.current?.click()}
        >
          Choose photograph
        </button>
        {file && (
          <>
            <span
              className="muted"
              style={{ fontSize: 12, overflowWrap: "anywhere" }}
            >
              {file.name}
            </span>
            <button
              className="btn"
              disabled={upload.isPending}
              onClick={() => upload.mutate()}
            >
              {upload.isPending ? "Saving…" : "Save evidence"}
            </button>
          </>
        )}
      </div>
    </section>
  );
}
