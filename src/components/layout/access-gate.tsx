"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft01Icon,
  Clock01Icon,
  Loading03Icon,
  Logout01Icon,
  Mail01Icon,
  RefreshIcon,
  Shield01Icon,
} from "hugeicons-react";
import { Brand } from "@/components/workspace/shared";
import { CornerGlow } from "@/components/ui/corner-glow";
import styles from "./access-gate.module.css";

type AccessGateProps = {
  pending: boolean;
  email?: string;
  error: string;
  onRefresh: () => Promise<void>;
  onSignOut: () => Promise<void>;
};

export function AccessGate({ pending, email, error, onRefresh, onSignOut }: AccessGateProps) {
  const [checking, setChecking] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [checked, setChecked] = useState(false);

  async function checkAccess() {
    setChecking(true);
    setChecked(false);
    try {
      await onRefresh();
      setChecked(true);
    } finally {
      setChecking(false);
    }
  }

  async function leave() {
    setSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="relative isolate flex h-dvh flex-col overflow-hidden bg-[#0c0c0f]">
      <CornerGlow />
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/[.06] px-[max(20px,env(safe-area-inset-left))] pt-[env(safe-area-inset-top)] pr-[max(20px,env(safe-area-inset-right))] sm:px-8 lg:px-12">
        <div className="flex h-16 items-center gap-6 sm:h-18">
          <Brand compact />
          <span className="hidden border-l border-zinc-800 pl-6 text-[11px] tracking-wide text-zinc-500 sm:block">Search & reconnect</span>
        </div>
        <Link href="/" className="flex min-h-11 items-center gap-2 rounded-md px-2 text-xs text-zinc-400 transition-colors hover:text-violet-200">
          <ArrowLeft01Icon size={16} aria-hidden="true" />
          Back to home
        </Link>
      </header>

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-[max(20px,env(safe-area-inset-left))] py-[clamp(12px,2dvh,24px)] pr-[max(20px,env(safe-area-inset-right))] sm:px-8">
        <section aria-labelledby="access-heading" className={`${styles.stage} relative flex h-full max-h-[640px] min-h-0 w-full max-w-[480px] flex-col items-center text-center`}>
          <div className="inline-flex shrink-0 items-center gap-2.5 py-1 text-[11px] font-medium text-violet-200">
            {pending ? (
              <span aria-hidden="true" className={`${styles.statusDot} size-1.5 rounded-full bg-violet-300`} />
            ) : (
              <Shield01Icon size={14} aria-hidden="true" />
            )}
            {pending ? "Awaiting team approval" : "Workspace connection"}
          </div>

          <div className="relative mx-auto my-[clamp(8px,2dvh,20px)] max-h-[260px] min-h-0 w-full max-w-[300px] flex-1">
            <div aria-hidden="true" className={`${styles.halo} pointer-events-none absolute -inset-8`} />
            <Image
              src={pending ? "/assets/access/approval.webp" : "/assets/access/workspace.webp"}
              alt=""
              fill
              sizes="(max-width: 360px) 80vw, 300px"
              className={`${styles.illustration} object-contain`}
            />
          </div>

          <div className={`${styles.content} w-full shrink-0`}>
            <h1 id="access-heading" className="text-[28px]! leading-tight! font-semibold! tracking-[-.04em]! text-violet-200 sm:text-[36px]!">
              {pending ? "Your team is next." : "Let’s reconnect."}
            </h1>
            <p className="mx-auto mt-[clamp(8px,1.5dvh,12px)] max-w-[390px] text-[13px] leading-[22px] text-zinc-400 sm:text-sm sm:leading-6">
              {pending
                ? "You’re signed in. Your team administrator will approve your role before you can enter the workspace."
                : "We couldn’t load your team profile. Check your connection and try again."}
            </p>

            {email && (
              <div className="mx-auto mt-[clamp(12px,2dvh,20px)] flex w-fit max-w-full items-center gap-2 text-xs leading-5 text-zinc-300">
                <Mail01Icon size={15} className="shrink-0 text-zinc-500" aria-hidden="true" />
                <span className="truncate" title={email}>{email}</span>
              </div>
            )}

            {error && (
              <div role="alert" className="mt-5 rounded-lg border border-red-300/20 bg-red-300/5 px-4 py-3 text-left text-xs leading-6 text-red-200 [overflow-wrap:anywhere]">
                {error}
              </div>
            )}

            <div className="mx-auto mt-[clamp(16px,3dvh,24px)] grid max-w-[360px] grid-cols-2 gap-3">
              <button
                type="button"
                disabled={checking || signingOut}
                aria-busy={checking}
                onClick={() => void checkAccess()}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-violet-300/30 bg-violet-600 px-2 py-2.5 text-xs! font-semibold! text-white shadow-[0_4px_16px_#7c3aed20] transition-colors hover:bg-violet-500 focus-visible:outline-violet-300 disabled:opacity-60 sm:min-h-12 sm:px-4 sm:text-sm!"
              >
                {checking
                  ? <Loading03Icon size={17} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  : <RefreshIcon size={17} aria-hidden="true" />}
                {checking ? "Checking…" : "Check again"}
              </button>
              <button
                type="button"
                disabled={checking || signingOut}
                aria-busy={signingOut}
                onClick={() => void leave()}
                className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-zinc-700/70 bg-zinc-900/60 px-2 py-2.5 text-xs! font-medium! text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 disabled:opacity-60 sm:min-h-12 sm:px-4 sm:text-sm!"
              >
                {signingOut
                  ? <Loading03Icon size={17} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  : <Logout01Icon size={17} aria-hidden="true" />}
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>

            <div role="status" aria-live="polite" className="mt-[clamp(8px,1.5dvh,16px)] flex min-h-5 items-center justify-center gap-2 text-[10px] leading-5 text-zinc-500 sm:text-[11px]">
              <Clock01Icon size={13} className="shrink-0" aria-hidden="true" />
              {checking ? "Checking your latest access status" : checked && !error ? "Access status checked just now" : pending ? "Check back once your administrator approves access" : "Your account stays signed in while you retry"}
            </div>
          </div>
        </section>
      </main>

      <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-white/[.06] px-[max(20px,env(safe-area-inset-left))] py-4 pr-[max(20px,env(safe-area-inset-right))] pb-[max(16px,env(safe-area-inset-bottom))] text-[11px] text-zinc-500 sm:px-8 lg:px-12">
        <span>ResQ · Search & reconnect</span>
        <span className="hidden items-center gap-2 sm:flex"><Shield01Icon size={13} aria-hidden="true" />Team-approved access</span>
      </footer>
    </div>
  );
}
