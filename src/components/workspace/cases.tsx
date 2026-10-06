"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/components/providers/auth-provider";
import { api } from "@/lib/api";
import type { Person } from "@/lib/types";
import {
  Artwork,
  EmptyState,
  ErrorMessage,
  PageHeading,
} from "./shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export { Cases } from "./case-registry";
export function CaseIntake() {
  const router = useRouter();
  const client = useQueryClient();
  const { profile } = useAuth();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [basis, setBasis] = useState("");
  const create = useMutation({
    mutationFn: () =>
      api<Person>("/api/cases", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          age: age ? Number(age) : null,
          last_seen: location.trim(),
          notes: notes.trim(),
          consent_basis: basis,
        }),
      }),
    onSuccess: async (person) => {
      await client.invalidateQueries({ queryKey: ["cases"] });
      router.push(`/cases/${person.id}`);
    },
  });
  if (profile?.role === "verifier")
    return (
      <EmptyState
        title="Case registration requires a rescuer."
        description="Your verifier role can search cases and review leads."
      />
    );
  return (
    <div>
      <PageHeading
        eyebrow="CASE INTAKE"
        title="Start with what you know."
        description="Register the person first. Add a reference photograph on the next screen."
        action={
          <Link className="text-link" href="/dashboard?tab=cases">
            Back to cases
          </Link>
        }
      />
      <div className="detail-grid">
        <form
          className="panel form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            create.mutate();
          }}
        >
          <label className="field">
            Full name
            <input
              required
              maxLength={120}
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="off"
            />
          </label>
          <div className="grid-two">
            <label className="field">
              Age, if known
              <input
                type="number"
                min={0}
                max={120}
                step={1}
                value={age}
                onChange={(event) => setAge(event.target.value)}
              />
            </label>
            <label className="field">
              Last-seen location
              <input
                maxLength={240}
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              />
            </label>
          </div>
          <label className="field">
            Case notes
            <textarea
              maxLength={2000}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>
          <label className="field">
            Authority to register this case
            <Select
              required
              name="consent_basis"
              value={basis}
              onValueChange={setBasis}
            >
              <SelectTrigger aria-label="Authority to register this case">
                <SelectValue placeholder="Choose a basis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="self">Consent from the person</SelectItem>
                <SelectItem value="family">Family consent</SelectItem>
                <SelectItem value="authority">
                  Authorized official request
                </SelectItem>
                <SelectItem value="research">Research consent</SelectItem>
              </SelectContent>
            </Select>
            <small>
              Record the actual consent or authority for collecting this
              evidence.
            </small>
          </label>
          <ErrorMessage error={create.error} />
          <button
            className="btn"
            disabled={create.isPending || !name.trim() || !basis}
          >
            {create.isPending ? "Registering…" : "Register case"}
          </button>
        </form>
        <div className="panel">
          <Artwork name="workspace/capture" className="intake-art" />
          <h2>Give the next search a starting point.</h2>
          <p className="page-description">
            Clear details and reference photographs help your team assess
            possible leads. Only register evidence you are authorized to
            collect.
          </p>
        </div>
      </div>
    </div>
  );
}
export { CaseRecord } from "./case-record";
