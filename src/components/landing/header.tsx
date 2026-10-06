"use client";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  m,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import Link from "next/link";
import { ArrowRight01Icon, Menu01Icon, Cancel01Icon } from "hugeicons-react";
import { Brand } from "@/components/workspace/shared";
const links = [
  { label: "Workspace", href: "#workspace" },
  { label: "How it works", href: "#workflow" },
  { label: "For your team", href: "#team" },
  { label: "FAQs", href: "#faq" },
];
export function LandingHeader() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ trackContentSize: true });
  const progress = useSpring(scrollYProgress, { stiffness: 180, damping: 35 });
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [open]);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[.07] bg-[#09090b]/85 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
      <div className="site-container flex h-16 items-center justify-between gap-2 sm:h-[76px] sm:gap-5">
        <div className="flex items-center gap-6">
          <Brand compact large />
          <span className="hidden border-l border-zinc-800 pl-6 font-mono text-[9px] leading-relaxed tracking-[.2em] text-zinc-500 xl:block">
            THE SEARCH
            <br />
            WORKSPACE
          </span>
        </div>
        <nav
          className="hidden items-center gap-8 lg:flex"
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <a
              className="text-[12px] text-zinc-400 transition-colors hover:text-white"
              key={link.href}
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2 sm:gap-5">
          <Link
            href="/login"
            className="hidden text-[12px] text-zinc-400 transition-colors hover:text-white sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="landing-button landing-button-violet !min-h-11 !gap-2 !rounded-lg !px-3 !text-[11px] sm:!px-4"
          >
            <span>
              <span className="hidden sm:inline">Open </span>workspace
            </span>{" "}
            <ArrowRight01Icon size={14} className="hidden min-[380px]:block" />
          </Link>
          <button
            ref={menuButton}
            className="flex size-11 items-center justify-center rounded-lg border border-violet-300/20 text-violet-200 lg:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="mobile-landing-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <Cancel01Icon size={18} /> : <Menu01Icon size={18} />}
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <m.nav
            key="mobile-navigation"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: reduced ? 0 : 0.24,
              ease: [0.22, 1, 0.36, 1],
            }}
            id="mobile-landing-navigation"
            aria-label="Mobile navigation"
            className="max-h-[calc(100dvh-var(--landing-header-height))] overflow-y-auto overscroll-contain lg:hidden"
          >
            <div className="site-container grid gap-1 border-t border-zinc-800 pb-6 pt-4">
              {links.map((link) => (
                <a
                  className="rounded-lg px-3 py-3 text-sm text-zinc-300 hover:bg-zinc-900"
                  href={link.href}
                  key={link.href}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Link
                className="rounded-lg px-3 py-3 text-sm text-violet-300"
                href="/login"
                onClick={() => setOpen(false)}
              >
                Sign in to ResQ
              </Link>
            </div>
          </m.nav>
        )}
      </AnimatePresence>
      <m.div
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-violet-400"
        style={{ scaleX: reduced ? scrollYProgress : progress }}
        aria-hidden="true"
      />
    </header>
  );
}
