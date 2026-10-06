import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight01Icon,
  ArrowDown01Icon,
  Search01Icon,
  Folder01Icon,
  CheckmarkCircle01Icon,
  Camera01Icon,
  Video01Icon,
  Image01Icon,
  Shield02Icon,
  UserGroupIcon,
  LockKeyIcon,
  Tick01Icon,
  PlusSignIcon,
} from "hugeicons-react";
import { Brand, Artwork } from "@/components/workspace/shared";
import { LandingHeader } from "@/components/landing/header";
import { SearchScene } from "@/components/landing/search-scene";
import { LandingMotion, Parallax, Reveal } from "@/components/landing/motion";
import { DisasterScene } from "@/components/landing/disaster-scene";

const features = [
  {
    number: "01",
    icon: Folder01Icon,
    title: "A record worth keeping.",
    description:
      "Give every case a clear starting point. Bring person details, reference photographs, and progress into one shared record.",
    artwork: "dashboard/cases",
    label: "Explore the registry",
    href: "/dashboard?tab=cases",
    caption: "CASE MANAGEMENT",
  },
  {
    number: "02",
    icon: Search01Icon,
    title: "A clue worth following.",
    description:
      "Select a face from a photograph, a video, or a camera frame. Search against the references your team has enrolled.",
    artwork: "dashboard/search",
    label: "Explore face search",
    href: "/dashboard?tab=search",
    caption: "SELECTED-FACE SEARCH",
  },
  {
    number: "03",
    icon: CheckmarkCircle01Icon,
    title: "A decision worth trusting.",
    description:
      "Put evidence in front of the right people. Review a possible lead independently and record the reason behind the decision.",
    artwork: "dashboard/review",
    label: "Explore the review queue",
    href: "/dashboard?tab=reviews",
    caption: "INDEPENDENT REVIEW",
  },
];
const steps = [
  {
    title: "Register the case",
    description:
      "Start with what you know. Add the person’s details and the authority to collect their evidence.",
    icon: Folder01Icon,
  },
  {
    title: "Capture the clue",
    description:
      "Choose a photograph, sample a video, or freeze a camera frame. Select the face you intend to search.",
    icon: Camera01Icon,
  },
  {
    title: "Compare the leads",
    description:
      "Search enrolled references and examine the candidates returned by the model service.",
    icon: Search01Icon,
  },
  {
    title: "Make the decision",
    description:
      "An independent reviewer assesses the evidence and records a reasoned verification or rejection.",
    icon: CheckmarkCircle01Icon,
  },
];
const roles = [
  {
    title: "Rescuers",
    label: "ON THE GROUND",
    avatar: "ranger",
    description:
      "Build a useful case record and turn the next clue into a search.",
    permissions: [
      "Register missing-person cases",
      "Enroll reference photographs",
      "Search for possible leads",
    ],
  },
  {
    title: "Verifiers",
    label: "BEHIND THE DECISION",
    avatar: "analyst",
    description: "Give each lead an independent look, with evidence at hand.",
    permissions: [
      "Search the case registry",
      "Compare available evidence",
      "Record review decisions",
    ],
  },
  {
    title: "Administrators",
    label: "CONNECTING THE TEAM",
    avatar: "lead",
    description:
      "Keep the workspace accessible to the right people, in the right roles.",
    permissions: [
      "Approve workspace access",
      "Assign team roles",
      "Manage cases and review leads",
    ],
  },
];
const questions = [
  {
    question: "Does a face match confirm someone’s identity?",
    answer:
      "No. The service returns similarity-ranked candidates for independent review. A similarity score is not an identity probability. An authorized reviewer must assess the available evidence and record a reason. Disaster identity accuracy has not been validated.",
  },
  {
    question: "Can I use photographs, video, and a live camera?",
    answer:
      "Yes. Upload a JPEG, PNG, or WebP photograph, choose a supported video, or use your browser’s camera. Video and live capture produce frames from which you select a face. Live detection requires the backend and Redis, and browser camera access requires HTTPS or localhost.",
  },
  {
    question: "What happens to the search photograph?",
    answer:
      "The backend processes query photographs in memory and does not save them. Enrolled case reference photos are stored privately and accessed using temporary signed links. A review may therefore have an unavailable search photograph.",
  },
  {
    question: "How does my team get access?",
    answer:
      "Sign in with your Google account. New accounts wait for an administrator to approve their role. Rescuers register cases and evidence, verifiers review leads, and administrators manage team access. The backend enforces these permissions.",
  },
  {
    question: "Can I use the workspace on my phone?",
    answer:
      "Yes. The browser workspace adapts to smaller screens with mobile navigation and touch-friendly controls. The native mobile application and this web application use the same configured authentication and model services.",
  },
];

function SectionLabel({
  number,
  children,
}: {
  number: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <p className="landing-section-label mb-5 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[.12em] sm:text-[10px] sm:tracking-[.18em]">
        <span className="shrink-0 text-zinc-600">{number}</span>
        <span className="h-px w-6 shrink-0 bg-violet-400/50" />
        <span className="min-w-0 text-violet-300">{children}</span>
      </p>
    </Reveal>
  );
}

export default function HomePage() {
  return (
    <LandingMotion>
      <div className="marketing-page overflow-x-clip bg-[#09090b] text-zinc-100">
        <LandingHeader />
        <main>
          <section className="marketing-hero relative flex min-h-[100svh] flex-col justify-between overflow-hidden border-b border-white/[.07] pt-[var(--landing-header-height)] lg:h-[100dvh] lg:min-h-[580px]">
            <Parallax
              className="pointer-events-none absolute inset-0"
              contentClassName="absolute inset-x-0 -inset-y-20"
              distance={70}
            >
              <div
                className="pattern-grid absolute inset-0 opacity-45"
                aria-hidden="true"
              />
            </Parallax>
            <div
              className="hero-vignette absolute inset-0"
              aria-hidden="true"
            />
            <div className="hero-layout site-container relative my-auto grid min-w-0 flex-1 items-center gap-5 pb-8 pt-4 sm:gap-6 sm:py-6 lg:grid-cols-[1.05fr_1fr] lg:py-6">
              <div className="hero-copy relative z-10 order-2 flex w-full min-w-0 max-w-[650px] flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
                <Reveal>
                  <div className="mb-4 inline-flex max-w-full items-center justify-center gap-2 font-mono text-[8px] leading-5 tracking-[.08em] text-zinc-400 min-[400px]:text-[9px] sm:mb-5 sm:text-[10px] lg:justify-start">
                    <span className="relative flex size-2">
                      <span className="absolute inset-0 rounded-full bg-violet-400/25" />
                      <span className="m-auto size-1 rounded-full bg-violet-300" />
                    </span>
                    BUILT FOR THE PEOPLE WHO KEEP LOOKING
                  </div>
                </Reveal>
                <Reveal delay={0.08}>
                  <h1 className="hero-title font-medium text-center lg:text-left">
                    Bring every
                    <br />
                    clue into <span className="hero-word">focus.</span>
                  </h1>
                </Reveal>
                <Reveal delay={0.16}>
                  <p className="mx-auto mt-4 max-w-[460px] text-center text-sm leading-[1.8] text-zinc-400 sm:mt-5 sm:text-[15px] lg:mx-0 lg:text-left lg:text-base">
                    A shared workspace for missing-person cases, face search,
                    and independent review. Less distance between your team and
                    the next answer.
                  </p>
                </Reveal>
                <Reveal delay={0.24}>
                  <div className="hero-actions mx-auto mt-6 grid w-full max-w-[420px] grid-cols-1 items-center gap-3 min-[400px]:grid-cols-2 sm:mt-7 sm:gap-4 lg:mx-0 lg:flex lg:w-auto lg:max-w-none lg:justify-start">
                    <Link
                      href="/dashboard"
                      className="landing-button landing-button-violet min-w-0 !min-h-12 !gap-2 !px-4 !text-xs sm:!gap-3 sm:!px-5 whitespace-nowrap"
                    >
                      <span>Open workspace</span>{" "}
                      <ArrowRight01Icon size={14} className="sm:hidden" />
                      <ArrowRight01Icon
                        size={17}
                        className="hidden sm:inline"
                      />
                    </Link>
                    <a
                      href="#workflow"
                      className="landing-button landing-button-outline group min-w-0 !min-h-12 !gap-2 !px-4 !text-xs sm:!gap-3 whitespace-nowrap"
                    >
                      <span>See how it works</span>{" "}
                      <ArrowDown01Icon
                        size={13}
                        className="transition-transform group-hover:translate-y-0.5 sm:size-3.5"
                      />
                    </a>
                  </div>
                </Reveal>
                <div className="hero-trust mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-[11px] text-zinc-500 sm:mt-7 sm:gap-x-5 lg:justify-start">
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <Shield02Icon size={13} />
                    Role-based access
                  </span>
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <UserGroupIcon size={13} />
                    Human-reviewed leads
                  </span>
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <LockKeyIcon size={13} />
                    Private references
                  </span>
                </div>
              </div>
              <Parallax
                className="hero-scene relative order-1 mx-auto h-[clamp(190px,30svh,260px)] w-full min-w-0 max-w-[380px] sm:h-[320px] sm:max-w-[480px] lg:order-2 lg:-mr-12 lg:h-[min(520px,56vh)] lg:max-w-none xl:h-[min(580px,60vh)]"
                contentClassName="relative h-full"
                distance={55}
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,.09),transparent_65%)]" />
                <SearchScene />
              </Parallax>
            </div>
            <div className="relative shrink-0 border-t border-white/[.06]">
              <div className="hero-capabilities site-container grid grid-cols-2 sm:grid-cols-4">
                {[
                  { icon: Folder01Icon, title: "Case registry" },
                  { icon: Search01Icon, title: "Face search" },
                  { icon: Camera01Icon, title: "Live capture" },
                  { icon: CheckmarkCircle01Icon, title: "Independent review" },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex min-w-0 items-center justify-center gap-2 px-2 py-4 font-mono text-[8px] uppercase tracking-[.1em] text-zinc-400 sm:gap-2.5 sm:py-3.5 sm:text-[9px] sm:tracking-[.13em]"
                  >
                    <item.icon size={15} className="shrink-0 text-zinc-500" />
                    {item.title}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section
            id="workspace"
            className="site-container section-space scroll-mt-24"
          >
            <SectionLabel number="01">The workspace</SectionLabel>
            <Reveal className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <h2 className="section-title max-w-[600px]">
                Built around the case.
                <br />
                <span className="heading-secondary">
                  Designed for the team.
                </span>
              </h2>
              <p className="max-w-[315px] text-[13px] leading-7 text-zinc-500">
                The details, the search, and the decision belong together. Give
                your team a place to move through them.
              </p>
            </Reveal>
            <div className="grid gap-5 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Reveal
                  key={feature.number}
                  delay={index * 0.09}
                  className="h-full"
                >
                  <article className="product-feature group h-full overflow-hidden rounded-xl border border-white/[.08] bg-[#101012] transition-colors hover:border-violet-300/25">
                    <div className="relative flex h-[215px] items-center justify-center overflow-hidden border-b border-white/[.06] bg-[radial-gradient(ellipse_at_bottom,rgba(167,139,250,.07),transparent_75%)] sm:h-[240px]">
                      <div
                        className="pattern-dots absolute inset-0 opacity-35"
                        aria-hidden="true"
                      />
                      <span className="absolute left-5 top-5 font-mono text-[9px] tracking-[.13em] text-zinc-600">
                        {feature.number} / {feature.caption}
                      </span>
                      <Parallax className="relative" distance={24}>
                        <Artwork
                          name={feature.artwork}
                          className="relative !h-[185px] !w-[220px] saturate-[.6] transition-transform duration-500 group-hover:scale-105 sm:translate-y-3"
                        />
                      </Parallax>
                      <feature.icon
                        size={18}
                        className="absolute bottom-4 right-5 text-zinc-600"
                      />
                    </div>
                    <div className="p-5 sm:p-7">
                      <h3 className="!text-[20px] !font-medium !tracking-[-.5px]">
                        {feature.title}
                      </h3>
                      <p className="mt-4 min-h-[84px] text-[13px] leading-7 text-zinc-500">
                        {feature.description}
                      </p>
                      <Link
                        href={feature.href}
                        className="mt-6 flex items-center justify-between border-t border-white/[.06] pt-5 text-[11px] text-zinc-300 transition-colors hover:text-violet-300"
                      >
                        {feature.label}
                        <ArrowRight01Icon size={15} />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>

          <section
            id="workflow"
            className="relative scroll-mt-20 overflow-hidden border-y border-white/[.07] bg-[#0c0c0e]"
          >
            <Parallax
              className="pointer-events-none absolute inset-0"
              contentClassName="absolute inset-x-0 -inset-y-20"
              distance={60}
            >
              <div
                className="pattern-grid absolute inset-0 opacity-25"
                aria-hidden="true"
              />
            </Parallax>
            <div className="site-container section-space relative">
              <SectionLabel number="02">A considered process</SectionLabel>
              <Reveal className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                <h2 className="section-title">
                  From the first detail
                  <br />
                  to the <span className="text-violet-200">next decision.</span>
                </h2>
                <p className="max-w-[330px] text-[13px] leading-7 text-zinc-500">
                  Four connected steps. A clear handoff between collecting
                  evidence, following a lead, and reviewing it.
                </p>
              </Reveal>
              <div className="grid gap-0 md:grid-cols-4">
                {steps.map((step, index) => (
                  <Reveal key={step.title} delay={index * 0.09}>
                    <article className="relative border-t border-zinc-800 pb-5 pt-8 md:pr-7">
                      <span className="absolute -top-[5px] left-0 size-[9px] rounded-full border border-violet-300/40 bg-[#0c0c0e]" />
                      <div className="mb-7 flex items-center gap-3">
                        <span className="font-mono text-[10px] text-zinc-600">
                          0{index + 1}
                        </span>
                        <step.icon size={18} className="text-zinc-400" />
                      </div>
                      <h3 className="!text-base !font-medium">{step.title}</h3>
                      <p className="mt-3 text-xs leading-6 text-zinc-500">
                        {step.description}
                      </p>
                    </article>
                  </Reveal>
                ))}
              </div>
              <div className="mt-9 flex items-center gap-3 border-t border-white/[.06] pt-6 text-[11px] text-zinc-500">
                <Shield02Icon
                  size={15}
                  className="shrink-0 text-violet-300/70"
                />
                The model suggests a lead. Your team makes the decision.
              </div>
            </div>
          </section>

          <section
            id="capture"
            className="site-container section-space scroll-mt-24"
          >
            <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-24">
              <Reveal>
                <SectionLabel number="03">
                  More ways to follow a clue
                </SectionLabel>
                <h2 className="section-title">
                  The right starting point.
                  <br />
                  <span className="heading-secondary">In any format.</span>
                </h2>
                <p className="mt-6 max-w-[420px] text-[13px] leading-7 text-zinc-500">
                  A still photograph, a moment in a video, or a camera frame.
                  Bring the evidence you have, then choose exactly who you want
                  to search.
                </p>
                <div className="mt-8 divide-y divide-zinc-800/70">
                  {[
                    {
                      icon: Image01Icon,
                      title: "Photographs",
                      text: "Upload a clear image and select a detected face.",
                    },
                    {
                      icon: Video01Icon,
                      title: "Video frames",
                      text: "Sample a clip and choose a frame with a usable face.",
                    },
                    {
                      icon: Camera01Icon,
                      title: "Live camera",
                      text: "Detect faces as you capture. Freeze a frame to continue.",
                    },
                  ].map((mode) => (
                    <div key={mode.title} className="flex gap-4 py-5">
                      <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/40 text-violet-200/75">
                        <mode.icon size={17} />
                      </div>
                      <div>
                        <h3 className="!text-[13px] !font-medium">
                          {mode.title}
                        </h3>
                        <p className="mt-1 text-xs leading-6 text-zinc-500">
                          {mode.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/dashboard?tab=search"
                  className="landing-button landing-button-outline mt-7"
                >
                  Start with a clue <ArrowRight01Icon size={15} />
                </Link>
              </Reveal>
              <Reveal delay={0.12} className="min-w-0">
                <div className="capture-composition relative min-h-[440px] overflow-hidden rounded-2xl border border-white/[.08] bg-[#101013]">
                  <div
                    className="pattern-dots absolute inset-0 opacity-50"
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(167,139,250,.10),transparent_65%)]" />
                  <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-white/[.06] px-5 py-4 font-mono text-[8px] tracking-[.12em] text-zinc-500 sm:px-6 sm:text-[9px]">
                    <span>EVIDENCE CAPTURE</span>
                    <span className="flex items-center gap-2">
                      <span className="size-1 rounded-full bg-violet-300" />
                      SELECTED-FACE SEARCH
                    </span>
                  </div>
                  <Parallax distance={35}>
                    <Artwork
                      name="onboarding/capture"
                      className="relative mx-auto !h-[280px] !w-full !max-w-[350px] saturate-[.5] sm:!h-[325px]"
                    />
                  </Parallax>
                  <div className="relative mx-4 mb-5 flex items-center justify-between gap-3 rounded-lg border border-white/[.08] bg-zinc-950/80 px-3 py-4 sm:mx-6 sm:mb-6 sm:px-5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-violet-300/10 text-violet-200">
                        <Camera01Icon size={15} />
                      </span>
                      <div>
                        <p className="text-xs text-zinc-300">
                          One face. A deliberate search.
                        </p>
                        <p className="mt-1 text-[10px] text-zinc-600">
                          Select before you compare.
                        </p>
                      </div>
                    </div>
                    <ArrowRight01Icon size={15} className="text-zinc-500" />
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          <section
            id="review"
            className="relative scroll-mt-20 overflow-hidden border-y border-white/[.07] bg-[#0d0c10]"
          >
            <Parallax
              className="pointer-events-none absolute inset-0"
              contentClassName="absolute inset-x-0 -inset-y-20"
              distance={55}
            >
              <div
                className="pattern-dots absolute inset-0 opacity-25"
                aria-hidden="true"
              />
            </Parallax>
            <div className="site-container section-space relative grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
              <Reveal
                delay={0.1}
                className="relative order-2 min-w-0 overflow-hidden rounded-xl border border-white/[.08] bg-[#101013] lg:order-1"
              >
                <div className="flex items-center gap-2 border-b border-white/[.06] px-5 py-4">
                  <span className="size-1.5 rounded-full bg-zinc-700" />
                  <span className="size-1.5 rounded-full bg-zinc-700" />
                  <span className="size-1.5 rounded-full bg-zinc-700" />
                  <span className="ml-3 font-mono text-[9px] tracking-[.12em] text-zinc-600">
                    THE REVIEW WORKSPACE
                  </span>
                </div>
                <Parallax distance={28}>
                  <Artwork
                    name="workspace/review"
                    className="mx-auto !h-[240px] !w-full !max-w-[340px] saturate-[.5] sm:!h-[260px]"
                  />
                </Parallax>
                <div className="grid grid-cols-3 divide-x divide-white/[.06] border-t border-white/[.06]">
                  {[
                    "Compare evidence",
                    "Record a reason",
                    "Review independently",
                  ].map((label, index) => (
                    <div key={label} className="p-4">
                      <p className="font-mono text-[9px] text-violet-300/70">
                        0{index + 1}
                      </p>
                      <p className="mt-2 text-[10px] leading-5 text-zinc-400">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </Reveal>
              <Reveal className="order-1 min-w-0 lg:order-2">
                <SectionLabel number="04">
                  Human judgment, at the center
                </SectionLabel>
                <h2 className="section-title">
                  A possible match.
                  <br />
                  <span className="text-violet-200">
                    Never an automatic answer.
                  </span>
                </h2>
                <p className="mt-6 text-[13px] leading-7 text-zinc-400">
                  Face similarity narrows where to look. It does not establish
                  who someone is. ResQ gives your team the context to inspect a
                  lead and make a considered decision.
                </p>
                <div className="mt-7 space-y-4">
                  {[
                    "Similarity scores are not identity probabilities.",
                    "Available references stay alongside the case.",
                    "Review decisions include a recorded reason.",
                  ].map((text) => (
                    <div
                      key={text}
                      className="flex items-start gap-3 text-xs leading-6 text-zinc-500"
                    >
                      <Tick01Icon
                        size={15}
                        className="mt-1 shrink-0 text-violet-300/70"
                      />
                      {text}
                    </div>
                  ))}
                </div>
                <Link
                  href="/dashboard?tab=reviews"
                  className="mt-8 inline-flex items-center gap-3 text-xs text-zinc-300 hover:text-violet-200"
                >
                  Explore independent review <ArrowRight01Icon size={14} />
                </Link>
              </Reveal>
            </div>
          </section>

          <section
            id="team"
            className="site-container section-space scroll-mt-24"
          >
            <SectionLabel number="05">Made for your team</SectionLabel>
            <Reveal className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <h2 className="section-title">
                Different roles.
                <br />
                <span className="heading-secondary">One shared purpose.</span>
              </h2>
              <p className="max-w-[330px] text-[13px] leading-7 text-zinc-500">
                A clear division of responsibility keeps the work moving and the
                decisions accountable.
              </p>
            </Reveal>
            <div className="grid gap-5 lg:grid-cols-3">
              {roles.map((role, index) => (
                <Reveal key={role.title} delay={index * 0.09}>
                  <article className="h-full rounded-xl border border-white/[.08] bg-[#101012] p-6 sm:p-7">
                    <div className="mb-7 flex items-center justify-between">
                      <Image
                        src={`/assets/avatars/${role.avatar}.webp`}
                        width={56}
                        height={56}
                        alt=""
                        className="size-14 rounded-xl border border-zinc-800 bg-zinc-900 p-1 saturate-[.45]"
                      />
                      <UserGroupIcon size={18} className="text-zinc-700" />
                    </div>
                    <p className="font-mono text-[8px] tracking-[.15em] text-violet-300/75">
                      {role.label}
                    </p>
                    <h3 className="mt-3 !text-[23px] !font-medium">
                      {role.title}
                    </h3>
                    <p className="mt-3 min-h-[60px] text-xs leading-6 text-zinc-500">
                      {role.description}
                    </p>
                    <div className="mt-6 space-y-3 border-t border-white/[.06] pt-6">
                      {role.permissions.map((permission) => (
                        <p
                          key={permission}
                          className="flex items-center gap-2 text-[11px] text-zinc-400"
                        >
                          <Tick01Icon
                            size={13}
                            className="shrink-0 text-zinc-600"
                          />
                          {permission}
                        </p>
                      ))}
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
            <div className="mt-7 flex items-center gap-3 text-[11px] leading-6 text-zinc-500">
              <LockKeyIcon size={14} className="shrink-0" />
              New accounts wait for administrator approval. Workspace roles are
              enforced by the backend.
            </div>
          </section>

          <section
            id="faq"
            className="border-t border-white/[.07] scroll-mt-20"
          >
            <div className="site-container section-space grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-24">
              <Reveal>
                <SectionLabel number="06">A few useful answers</SectionLabel>
                <h2 className="section-title">
                  Before you
                  <br />
                  <span className="heading-secondary">get started.</span>
                </h2>
                <p className="mt-5 max-w-[290px] text-xs leading-7 text-zinc-500">
                  What the workspace can do, where the evidence goes, and how
                  your team stays in control.
                </p>
              </Reveal>
              <Reveal
                delay={0.1}
                className="divide-y divide-zinc-800/80 border-y border-zinc-800/80"
              >
                {questions.map((item) => (
                  <details key={item.question} className="faq-item group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-[13px] text-zinc-300 transition-colors hover:text-white">
                      {item.question}
                      <PlusSignIcon
                        size={15}
                        className="shrink-0 text-zinc-600 transition-transform group-open:rotate-45"
                      />
                    </summary>
                    <p className="max-w-[570px] pb-6 pr-7 text-xs leading-7 text-zinc-500">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </Reveal>
            </div>
          </section>

          <section className="relative overflow-hidden border-y border-white/[.08] bg-[#101013]">
            <Parallax
              className="pointer-events-none absolute inset-0"
              contentClassName="absolute inset-x-0 -inset-y-20"
              distance={65}
            >
              <div
                className="pattern-grid absolute inset-0 opacity-40"
                aria-hidden="true"
              />
            </Parallax>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,.1),transparent_70%)]" />
            <Reveal className="site-container relative py-20 text-center sm:py-28">
              <p className="mb-6 font-mono text-[9px] tracking-[.2em] text-violet-300">
                YOUR TEAM. YOUR NEXT LEAD.
              </p>
              <h2 className="closing-title">
                Keep looking.
                <br />
                <span className="heading-secondary">Together.</span>
              </h2>
              <p className="mx-auto mt-6 max-w-[420px] text-[13px] leading-7 text-zinc-500">
                Give every case a place, every clue a next step,
                <br className="hidden sm:block" />
                and every decision the attention it deserves.
              </p>
              <Link
                href="/dashboard"
                className="landing-button landing-button-violet mt-8"
              >
                Open your workspace <ArrowRight01Icon size={16} />
              </Link>
            </Reveal>
          </section>
        </main>
        <footer className="border-t border-white/[.08] bg-[#0c0c10] pb-10 pt-12 sm:pt-14 sm:pb-12">
          <div className="site-container">
            <div className="flex flex-col justify-between gap-10 sm:flex-row sm:items-start">
              <div>
                <Brand compact large />
                <p className="mt-3.5 max-w-[280px] text-xs sm:text-[13px] leading-6 text-zinc-400">
                  A connected search workspace.
                  <br />
                  Built around people. Supported by evidence.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-300">
                  <span className="size-1.5 rounded-full bg-violet-400" />
                  <span>ResQ Operations Platform</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 sm:flex sm:gap-16 text-xs">
                <div className="flex flex-col gap-1 sm:gap-1.5">
                  <span className="font-mono text-[9px] sm:text-[10px] font-semibold tracking-[0.16em] text-violet-300/80 uppercase mb-1">
                    WORKSPACE
                  </span>
                  <Link
                    className="text-zinc-400 hover:text-white transition-colors"
                    href="/dashboard?tab=cases"
                  >
                    Case registry
                  </Link>
                  <Link
                    className="text-zinc-400 hover:text-white transition-colors"
                    href="/dashboard?tab=search"
                  >
                    Face search
                  </Link>
                  <Link
                    className="text-zinc-400 hover:text-white transition-colors"
                    href="/dashboard?tab=reviews"
                  >
                    Reviews
                  </Link>
                </div>
                <div className="flex flex-col gap-1 sm:gap-1.5">
                  <span className="font-mono text-[9px] sm:text-[10px] font-semibold tracking-[0.16em] text-violet-300/80 uppercase mb-1">
                    GET STARTED
                  </span>
                  <a className="text-zinc-400 hover:text-white transition-colors" href="#workflow">
                    How it works
                  </a>
                  <a className="text-zinc-400 hover:text-white transition-colors" href="#faq">
                    FAQs
                  </a>
                  <Link className="text-zinc-400 hover:text-white transition-colors" href="/login">
                    Team sign-in
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-10 sm:mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/[.08] pt-6 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] sm:text-[11px] text-zinc-500">
                <span className="font-semibold text-zinc-300">ResQ</span>
                <span className="text-zinc-600">/</span>
                <span>SEARCH & RECONNECT</span>
              </div>
              <span className="font-mono text-[10px] sm:text-[11px] tracking-wider text-zinc-500 uppercase">
                HUMAN JUDGMENT AT EVERY STEP.
              </span>
            </div>
          </div>
        </footer>
        <DisasterScene />
      </div>
    </LandingMotion>
  );
}
