"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Loading03Icon,
  LockKeyIcon,
  Shield01Icon,
} from "hugeicons-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Brand, Loading } from "@/components/workspace/shared";
import { supabase } from "@/lib/supabase";
import { CornerGlow } from "@/components/ui/corner-glow";

function Login() {
  const router = useRouter();
  const params = useSearchParams();
  const { session, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const requested = params.get("next") ?? "/dashboard";
  const next =
    requested.startsWith("/") &&
    !requested.startsWith("//") &&
    !requested.includes("\\")
      ? requested
      : "/dashboard";
  useEffect(() => {
    if (!loading && session) router.replace(next);
  }, [loading, session, router, next]);
  async function signIn() {
    if (!supabase) return;
    setBusy(true);
    setError("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) throw error;
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  const signInError = error || params.get("error");
  const pending = busy || loading || Boolean(session);
  const buttonLabel = busy
    ? "Connecting to Google…"
    : loading
      ? "Checking your session…"
      : session
        ? "Opening your workspace…"
        : "Continue with Google";

  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-[clamp(16px,3dvh,28px)] flex size-11 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-300/5 text-violet-300 [@media(max-height:700px)]:hidden">
        <LockKeyIcon size={22} strokeWidth={1.5} aria-hidden="true" />
      </div>
      <p className="mb-2 text-[11px] font-medium tracking-[.12em] text-violet-300 uppercase">
        Your ResQ workspace
      </p>
      <h1
        id="sign-in-heading"
        className="text-[30px]! leading-tight! font-semibold! tracking-[-.035em]! text-violet-200 sm:text-[36px]!"
      >
        Welcome back.
      </h1>
      <p className="mt-3 text-sm leading-6 text-zinc-400 sm:text-[15px]">
        Sign in to your team’s cases, evidence, and next steps.
      </p>

      <div className="mt-[clamp(20px,3.5dvh,32px)] space-y-3">
        {signInError && (
          <div role="alert" className="rounded-lg border border-red-400/25 bg-red-400/5 px-4 py-3 text-sm text-red-200 [overflow-wrap:anywhere]">
            {signInError}
          </div>
        )}
        {!supabase && (
          <div role="alert" className="rounded-lg border border-amber-300/25 bg-amber-300/5 px-4 py-3 text-sm leading-6 text-amber-100">
            Sign-in is temporarily unavailable. Please contact your workspace administrator.
          </div>
        )}
        <button
          type="button"
          className="flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-zinc-100 bg-zinc-100 px-4 py-3 text-sm! font-semibold! text-zinc-950 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-300 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!supabase || pending}
          aria-busy={pending}
          onClick={() => void signIn()}
        >
          {pending ? (
            <Loading03Icon size={20} className="shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          ) : (
            <Image src="/assets/google-mark.svg" width={20} height={20} alt="" className="shrink-0" />
          )}
          <span aria-live="polite">{buttonLabel}</span>
        </button>
        <p className="text-center text-xs leading-5 text-zinc-400">
          New here? We’ll create your account at sign-in.
        </p>
      </div>

      <div className="mt-[clamp(20px,3.5dvh,32px)] border-t border-zinc-800 pt-5">
        <div className="flex items-start gap-3">
          <Shield01Icon size={19} strokeWidth={1.5} className="mt-0.5 shrink-0 text-zinc-400" aria-hidden="true" />
          <div>
            <p className="text-[13px] font-medium text-violet-200">Access is managed by your team</p>
            <p className="mt-1.5 text-xs leading-[22px] text-zinc-400">
              Your administrator approves access and assigns your role.
              Use your usual Google account to return.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function LoginPage() {
  return (
    <div className="relative isolate flex h-dvh w-full flex-col overflow-hidden bg-[#0c0c0f] text-zinc-100">
      <CornerGlow />
      <a href="#sign-in" className="sr-only rounded-md bg-zinc-100 p-3 text-zinc-950 focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50">
        Skip to sign in
      </a>
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-800/80 bg-[#0c0c0f] px-[max(20px,env(safe-area-inset-left))] pt-[env(safe-area-inset-top)] pr-[max(20px,env(safe-area-inset-right))] sm:px-8 lg:px-12">
        <div className="flex h-16 items-center gap-6 sm:h-18">
          <Brand compact />
          <span className="hidden border-l border-zinc-800 pl-6 text-[11px] tracking-wide text-zinc-500 sm:block">Search & reconnect</span>
        </div>
        <Link href="/" className="flex min-h-11 items-center gap-2 rounded-md px-2 text-xs text-zinc-400 transition-colors hover:text-zinc-100">
          <ArrowLeft01Icon size={16} aria-hidden="true" />
          <span>Back to home</span>
        </Link>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-[1.05fr_1fr] lg:grid-rows-[minmax(0,1fr)]">
        <section
          aria-labelledby="workspace-heading"
          className="hidden min-h-0 min-w-0 flex-col items-center border-r border-zinc-800/80 bg-[#111115] px-10 py-8 lg:flex xl:px-16"
        >
          <div className="relative min-h-0 w-full max-w-[480px] flex-1">
            <Image
              src="/assets/auth/login.webp"
              alt="A rescue volunteer connecting with her team."
              fill
              sizes="(min-width: 1024px) 40vw, 1px"
              className="object-contain"
            />
          </div>
          <div className="mt-6 w-full max-w-[480px] shrink-0 text-center lg:mt-5">
            <p className="mb-3 text-[10px] font-medium tracking-[.16em] text-violet-400 uppercase">
              Search & reconnect
            </p>
            <h2
              id="workspace-heading"
              className="text-[28px]! leading-tight! font-medium! tracking-[-.035em]! text-violet-200 sm:text-[34px]! xl:text-[38px]!"
            >
              Your team. Your next lead.
            </h2>
            <p className="mx-auto mt-3 max-w-[390px] text-[13px] leading-6 text-zinc-400">
              Bring clues, evidence, and people together.
              Move the search forward with ResQ.
            </p>
          </div>
        </section>

        <section
          id="sign-in"
          tabIndex={-1}
          aria-labelledby="sign-in-heading"
          className="flex min-h-0 min-w-0 flex-1 flex-col items-center overflow-y-auto overscroll-contain px-[max(20px,env(safe-area-inset-left))] pt-[clamp(20px,4dvh,40px)] pr-[max(20px,env(safe-area-inset-right))] pb-4 focus:outline-none sm:px-12 lg:px-10 lg:py-8 [@media(max-height:700px)]:pt-4"
        >
          <div className="my-auto flex w-full shrink-0 justify-center py-2">
            <Suspense fallback={<Loading label="Preparing sign-in…" />}>
              <Login />
            </Suspense>
          </div>
          <Link href="/#workflow" className="mt-4 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-2 text-xs text-zinc-400 transition-colors hover:text-violet-200 [@media(max-height:700px)]:mt-2">
            See how ResQ works
            <ArrowRight01Icon size={15} aria-hidden="true" />
          </Link>
        </section>
      </main>
      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-zinc-800/80 px-[max(20px,env(safe-area-inset-left))] py-4 pr-[max(20px,env(safe-area-inset-right))] pb-[max(16px,env(safe-area-inset-bottom))] text-[11px] text-zinc-500 sm:px-8 lg:px-12">
        <span>ResQ · Search & reconnect</span>
        <span className="hidden items-center gap-2 sm:flex">
          <LockKeyIcon size={13} aria-hidden="true" />
          Team-approved workspace access
        </span>
      </footer>
    </div>
  );
}
