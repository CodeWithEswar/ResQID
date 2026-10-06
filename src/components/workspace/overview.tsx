"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight01Icon,
  Search01Icon,
  Folder01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  PlusSignIcon,
  RefreshIcon,
  ArrowUpRight01Icon,
} from "hugeicons-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useCases, useReviews } from "@/hooks/use-workspace";
import type { Person, Profile, Review } from "@/lib/types";
import {
  activitySeries,
  dashboardSummary,
} from "@/lib/dashboard-data";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CaseAvatar } from "@/components/ui/gradient-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityChart, ReviewOrbit } from "./dashboard-charts";
import { ErrorMessage, Status, dateLabel } from "./shared";
import styles from "./overview.module.css";

type DashboardOverviewProps = {
  profile: Profile | null;
  cases?: Person[];
  reviews?: Review[];
  casesLoading?: boolean;
  reviewsLoading?: boolean;
  casesError?: Error | null;
  reviewsError?: Error | null;
  refreshing?: boolean;
  onRefresh: () => void;
};
const stageConfig = [
  { status: "pending", label: "Pending", color: "#fbbf24" },
  { status: "urgent", label: "Urgent", color: "#fb7185" },
  { status: "ongoing", label: "Ongoing", color: "#67d5e5" },
  { status: "completed", label: "Completed", color: "#6ee7b7" },
  { status: "closed", label: "Closed", color: "#71717a" },
];
function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-4">
      <Skeleton className="size-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-2 w-36 max-w-full" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  );
}
function EmptyList({
  type,
  canRegister,
}: {
  type: "cases" | "reviews";
  canRegister: boolean;
}) {
  const Icon = type === "cases" ? Folder01Icon : CheckmarkCircle01Icon;
  return (
    <div className="flex min-h-[190px] flex-col items-center justify-center px-4 py-6 text-center">
      <div className="mb-3 flex size-10 items-center justify-center rounded-xl border border-white/[.06] bg-white/[.02] text-zinc-500">
        <Icon size={20} aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-zinc-300">
        {type === "cases" ? "Ready for your first case" : "No pending reviews"}
      </p>
      <p className="mt-2 max-w-[250px] text-xs leading-5 text-zinc-500">
        {type === "cases"
          ? "New case records will appear here."
          : "Potential matches will appear here for your team to review."}
      </p>
      {type === "cases" && canRegister && (
        <Button asChild variant="link" size="sm" className="mt-3">
          <Link href="/cases/new">
            Register a case <ArrowRight01Icon size={14} aria-hidden="true" />
          </Link>
        </Button>
      )}
    </div>
  );
}

export function DashboardOverview({
  profile,
  cases,
  reviews,
  casesLoading,
  reviewsLoading,
  casesError,
  reviewsError,
  refreshing,
  onRefresh,
}: DashboardOverviewProps) {
  const [period, setPeriod] = useState(30);
  const [now] = useState(() => new Date());
  const summary = useMemo(
    () => dashboardSummary(cases || [], reviews || []),
    [cases, reviews],
  );
  const activity = useMemo(
    () => activitySeries(cases || [], reviews || [], period, now),
    [cases, reviews, period, now],
  );
  const periodCases = activity.reduce((total, day) => total + day.cases, 0);
  const periodReviews = activity.reduce((total, day) => total + day.reviews, 0);
  const recent = useMemo(
    () =>
      [...(cases || [])]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 4),
    [cases],
  );
  const queue = useMemo(
    () =>
      [...(reviews || [])]
        .filter((item) => item.status === "pending")
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 4),
    [reviews],
  );
  const stats = [
    {
      label: "Registered cases",
      value: cases ? summary.registered : undefined,
      icon: Folder01Icon,
      color: "text-violet-300 bg-violet-300/10 border-violet-300/15",
      note: `${periodCases} added in ${period} days`,
      href: "/dashboard?tab=cases",
      tag: "Registry",
    },
    {
      label: "Open cases",
      value: cases ? summary.open : undefined,
      icon: Search01Icon,
      color: "text-cyan-300 bg-cyan-300/10 border-cyan-300/15",
      note: `${summary.completed} closed or completed`,
      href: "/dashboard?tab=cases",
      tag: "In progress",
    },
    {
      label: "Pending reviews",
      value: reviews ? summary.pending : undefined,
      icon: Clock01Icon,
      color: "text-amber-300 bg-amber-300/10 border-amber-300/15",
      note: "Awaiting an independent decision",
      href: "/dashboard?tab=reviews",
      tag: "Needs review",
    },
    {
      label: "Verified leads",
      value: reviews ? summary.verified : undefined,
      icon: CheckmarkCircle01Icon,
      color: "text-emerald-300 bg-emerald-300/10 border-emerald-300/15",
      note: "Verified by your team",
      href: "/dashboard?tab=reviews",
      tag: "Reviewed",
    },
  ];
  return (
    <div className={`${styles.enter} ${styles.layout} space-y-5 sm:space-y-6`}>
      <div className={`${styles.heading} justify-between gap-4`}>
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-medium tracking-[.14em] text-violet-300 uppercase">
            <span className="h-px w-4 bg-violet-400" aria-hidden="true" />
            Your connected workspace
          </div>
          <h1 className="text-[28px]! leading-tight! font-semibold! tracking-[-.04em]! text-violet-100 sm:text-[32px]!">
            Workspace overview
          </h1>
          <p className="mt-2 text-xs leading-6 text-zinc-400">
            Welcome back
            {profile?.display_name
              ? `, ${profile.display_name.split(" ")[0]}`
              : ""}
            . Let’s move the search forward.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <Button
            variant="outline"
            size="icon"
            className="size-11 rounded-xl"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh workspace data"
            aria-busy={refreshing}
          >
            <RefreshIcon
              size={17}
              className={
                refreshing ? "animate-spin motion-reduce:animate-none" : ""
              }
              aria-hidden="true"
            />
          </Button>
          {profile?.role !== "verifier" && (
            <Button asChild variant="outline" className="h-11 rounded-xl px-4 text-xs! font-semibold">
              <Link href="/cases/new">
                <PlusSignIcon size={16} aria-hidden="true" />
                New case
              </Link>
            </Button>
          )}
          <Button
            asChild
            variant="solid"
            className="h-11 rounded-xl px-4.5 text-xs! font-semibold"
          >
            <Link href="/dashboard?tab=search">
              <Search01Icon size={16} aria-hidden="true" />
              Start a search
            </Link>
          </Button>
        </div>
      </div>

      <Card
        className={`${styles.hero} relative overflow-hidden rounded-xl shadow-none`}
      >
        <div className="relative flex min-h-[148px] items-center justify-between gap-4 px-5 py-6 sm:px-6">
          <div className="relative z-10 max-w-[550px]">
            <Badge className="mb-3 border-violet-300/15 bg-violet-300/5 py-0.5 text-[9px] font-medium tracking-wider">
              EVERY CLUE COUNTS
            </Badge>
            <h2 className="text-[22px]! leading-tight! font-medium! tracking-[-.03em]! text-violet-100 sm:text-[25px]!">
              A clearer path to your next lead.
            </h2>
            <p className="mt-2 max-w-[440px] text-xs leading-6 text-zinc-400">
              Bring a photo, video, or camera frame. Explore possible
              connections, then put them in front of your team.
            </p>
            <Link
              href="/dashboard?tab=search"
              className="mt-3.5 inline-flex min-h-8 items-center gap-2 rounded-lg border border-violet-400/25 bg-gradient-to-b from-violet-500/15 to-violet-950/40 px-3.5 py-1.5 text-xs font-semibold text-violet-200 shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.15),inset_0_-1px_0_rgba(0,0,0,0.5),0_2px_6px_rgba(0,0,0,0.3)] transition-all hover:border-violet-400/50 hover:from-violet-500/25 hover:text-white hover:-translate-y-0.5 active:translate-y-0.5"
            >
              Explore face search{" "}
              <ArrowRight01Icon size={15} aria-hidden="true" />
            </Link>
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-2/5 opacity-30 [background-image:radial-gradient(#a78bfa60_1px,transparent_1px)] [background-size:16px_16px] [mask-image:linear-gradient(90deg,transparent,#000)]"
          />
          <Image
            src="/assets/dashboard/search.webp"
            width={160}
            height={160}
            alt=""
          className={`${styles.heroImage} relative size-36 shrink-0 object-contain lg:size-40`}
          />
        </div>
      </Card>

      {(casesError || reviewsError) && (
        <div className="space-y-2">
          <ErrorMessage error={casesError || reviewsError} />
          <p className="text-xs text-zinc-500">
            Refresh to try again. Available records are still shown below.
          </p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 sm:gap-4">
        {stats.map((item, index) => (
          <Link
            href={item.href}
            key={item.label}
            className="min-w-0 rounded-xl focus-visible:outline-violet-300"
          >
            <Card
              className={`${styles.surface} ${styles.stat} h-full rounded-xl p-4 shadow-none sm:p-5`}
            >
              <div className="flex items-center justify-between gap-2">
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg border ${item.color}`}
                >
                  <item.icon size={18} aria-hidden="true" />
                </div>
                <ArrowUpRight01Icon
                  size={14}
                  className="text-zinc-600"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-4 text-[10px] text-zinc-400 sm:text-xs">
                {item.label}
              </p>
              <div className="mt-1 flex items-end justify-between gap-2">
                <span className="text-[30px] leading-tight font-medium tracking-[-.04em] text-zinc-100 sm:text-[34px]">
                  {item.value === undefined &&
                  (index < 2 ? casesLoading : reviewsLoading) ? (
                    <Skeleton className="my-1 h-8 w-12" />
                  ) : (
                    (item.value ?? "—")
                  )}
                </span>
                <span className="hidden rounded-md border border-white/[.04] px-1.5 py-0.5 text-[9px] text-zinc-500 min-[1400px]:inline">
                  {item.tag}
                </span>
              </div>
              <p className="mt-2 text-[10px] leading-5 text-zinc-500">
                {item.value === undefined ? "Waiting for data" : item.note}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)]">
        <Card className={`${styles.surface} min-w-0 rounded-xl shadow-none`}>
          <CardHeader className="flex-row flex-wrap items-start justify-between gap-3 space-y-0 p-5 md:p-5">
            <div>
              <CardTitle className="text-sm! leading-tight! font-medium! tracking-normal!">
                Case & lead activity
              </CardTitle>
              <CardDescription className="mt-1 text-[11px]">
                New records created each day
              </CardDescription>
            </div>
            <div
              role="group"
              aria-label="Activity period"
              className="flex gap-1 rounded-lg border border-white/[.06] bg-zinc-950/40 p-1"
            >
              {[7, 30, 90].map((days) => (
                <button
                  type="button"
                  key={days}
                  aria-pressed={period === days}
                  onClick={() => setPeriod(days)}
                  className={`min-h-9 rounded-md px-3 text-[10px]! transition-colors sm:min-h-7 ${period === days ? "bg-violet-300/10 text-violet-200" : "text-zinc-500 hover:text-zinc-200"}`}
                >
                  {days}D
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-5 pt-0 md:px-5 md:pb-5 md:pt-0">
            <div className="mb-5 flex flex-wrap gap-x-6 gap-y-2 px-1 text-[11px] text-zinc-400">
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-violet-300" />
                New cases{" "}
                <strong className="ml-1 font-mono font-medium text-zinc-200">
                  {cases ? periodCases : "—"}
                </strong>
              </span>
              <span className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-cyan-300" />
                Review leads{" "}
                <strong className="ml-1 font-mono font-medium text-zinc-200">
                  {reviews ? periodReviews : "—"}
                </strong>
              </span>
            </div>
            {casesLoading || reviewsLoading ? (
              <Skeleton className="h-[240px] w-full" />
            ) : cases && reviews ? (
              <ActivityChart data={activity} />
            ) : (
              <div className="flex h-[240px] items-center justify-center text-xs text-zinc-500">
                Activity is available once both datasets load.
              </div>
            )}
            <div className="mt-5 border-t border-white/[.05] pt-4">
              <div className="mb-3 flex items-center justify-between gap-2 text-[10px]">
                <span className="text-zinc-400">Current case stages</span>
                <span className="text-zinc-500">
                  {cases ? `${cases.length} registered` : "Unavailable"}
                </span>
              </div>
              <div
                className="flex h-1.5 gap-1 overflow-hidden rounded-full bg-zinc-800/50"
                aria-hidden="true"
              >
                {cases?.length
                  ? stageConfig.map((stage) => (
                      <span
                        key={stage.status}
                        className="rounded-full"
                        style={{
                          width: `${(cases.filter((item) => item.status === stage.status).length / cases.length) * 100}%`,
                          background: stage.color,
                        }}
                      />
                    ))
                  : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[9px] text-zinc-500">
                {stageConfig.map((stage) => (
                  <span
                    key={stage.status}
                    className="flex items-center gap-1.5"
                  >
                    <span
                      className="size-1 rounded-full"
                      style={{ background: stage.color }}
                    />
                    {stage.label}
                    <span className="font-mono text-zinc-300">
                      {cases
                        ? cases.filter((item) => item.status === stage.status)
                            .length
                        : "—"}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={`${styles.surface} min-w-0 rounded-xl shadow-none`}>
          <CardHeader className="p-5 md:p-5">
            <CardTitle className="text-sm! leading-tight! font-medium! tracking-normal!">
              Review balance
            </CardTitle>
            <CardDescription className="text-[11px]">
              Current outcomes across your leads
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5 pt-0 md:px-5 md:pb-5 md:pt-0">
            {reviewsLoading ? (
              <Skeleton className="mx-auto size-[180px] rounded-full" />
            ) : reviews ? (
              <ReviewOrbit
                pending={summary.pending}
                verified={summary.verified}
                rejected={summary.rejected}
              />
            ) : (
              <div className="flex h-[180px] items-center justify-center text-xs text-zinc-500">
                Review data is unavailable.
              </div>
            )}
            <div className="mt-5 space-y-3">
              {[
                {
                  label: "Pending",
                  value: summary.pending,
                  color: "bg-amber-300",
                  description: "Awaiting a decision",
                },
                {
                  label: "Verified",
                  value: summary.verified,
                  color: "bg-emerald-300",
                  description: "Confirmed by your team",
                },
                {
                  label: "Rejected",
                  value: summary.rejected,
                  color: "bg-rose-300",
                  description: "Ruled out on review",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <span className="flex items-center gap-2 text-zinc-400">
                    <span className={`size-1.5 rounded-full ${item.color}`} />
                    {item.label}
                    <span className="hidden text-[10px] text-zinc-600 min-[420px]:inline xl:hidden min-[1500px]:inline">
                      {item.description}
                    </span>
                  </span>
                  <span className="font-mono text-zinc-200">
                    {reviews ? item.value : "—"}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-5 border-t border-white/[.05] pt-4 text-[10px] leading-5 text-zinc-500">
              Similarity provides a lead. Independent review determines the
              outcome.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className={`${styles.surface} min-w-0 rounded-xl shadow-none`}>
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 p-5 md:p-5">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm! leading-tight! font-medium! tracking-normal!">
                Recent cases
              </CardTitle>
              <Badge
                variant="secondary"
                className="rounded-md px-1.5 py-0 text-[9px]"
              >
                {cases?.length ?? "—"}
              </Badge>
            </div>
            <Link
              href="/dashboard?tab=cases"
              className="flex min-h-9 items-center gap-1.5 text-[11px] text-violet-300 hover:text-violet-100"
            >
              View all <ArrowRight01Icon size={13} aria-hidden="true" />
            </Link>
          </CardHeader>
          <CardContent className="px-5 pb-3 pt-0 md:px-5 md:pb-3 md:pt-0">
            {casesLoading ? (
              <>
                <RowSkeleton />
                <RowSkeleton />
              </>
            ) : recent.length ? (
              <div className="divide-y divide-white/[.05]">
                {recent.map((person) => (
                  <Link
                    key={person.id}
                    href={`/cases/${person.id}`}
                    className="group flex min-w-0 items-center gap-3 rounded-lg py-4 transition-colors hover:bg-white/[.015]"
                  >
                    <CaseAvatar name={person.name} id={person.id} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-zinc-200 group-hover:text-violet-200">
                        {person.name}
                      </p>
                      <p className="mt-1 truncate text-[10px] text-zinc-500">
                        {person.last_seen || "Location not recorded"}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <Status value={person.status} />
                      <span className="hidden text-[9px] text-zinc-600 sm:block">
                        {dateLabel(person.created_at)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : casesError ? (
              <p className="py-10 text-center text-xs text-zinc-500">
                Cases couldn’t be loaded.
              </p>
            ) : (
              <EmptyList
                type="cases"
                canRegister={profile?.role !== "verifier"}
              />
            )}
          </CardContent>
        </Card>
        <Card className={`${styles.surface} min-w-0 rounded-xl shadow-none`}>
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0 p-5 md:p-5">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm! leading-tight! font-medium! tracking-normal!">
                Review queue
              </CardTitle>
              <Badge
                variant="warning"
                className="rounded-md px-1.5 py-0 text-[9px]"
              >
                {reviews ? summary.pending : "—"}
              </Badge>
            </div>
            <Link
              href="/dashboard?tab=reviews"
              className="flex min-h-9 items-center gap-1.5 text-[11px] text-violet-300 hover:text-violet-100"
            >
              Open queue <ArrowRight01Icon size={13} aria-hidden="true" />
            </Link>
          </CardHeader>
          <CardContent className="px-5 pb-3 pt-0 md:px-5 md:pb-3 md:pt-0">
            {reviewsLoading ? (
              <>
                <RowSkeleton />
                <RowSkeleton />
              </>
            ) : queue.length ? (
              <div className="divide-y divide-white/[.05]">
                {queue.map((item) => (
                  <Link
                    key={item.id}
                    href="/dashboard?tab=reviews"
                    className="group flex min-w-0 items-center gap-3 rounded-lg py-4 transition-colors hover:bg-white/[.015]"
                  >
                    <CaseAvatar
                      name={item.persons?.name || "Case lead"}
                      id={item.person_id}
                      photo={item.case_photo_url}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-zinc-200 group-hover:text-violet-200">
                        {item.persons?.name || "Case lead"}
                      </p>
                      <p className="mt-1 text-[10px] text-zinc-500">
                        Similarity{" "}
                        <span className="font-mono text-zinc-400">
                          {Number.isFinite(item.score)
                            ? item.score.toFixed(3)
                            : "—"}
                        </span>
                        <span className="hidden sm:inline">
                          {" "}
                          · {dateLabel(item.created_at)}
                        </span>
                      </p>
                    </div>
                    <Status value={item.status} />
                  </Link>
                ))}
              </div>
            ) : reviewsError ? (
              <p className="py-10 text-center text-xs text-zinc-500">
                Reviews couldn’t be loaded.
              </p>
            ) : (
              <EmptyList type="reviews" canRegister={false} />
            )}
          </CardContent>
        </Card>
      </div>
      <p className="text-[10px] leading-5 text-zinc-600">
        Counts and charts reflect loaded records, up to 200 cases and 200 review
        leads. Activity dates use Asia/Kolkata.
      </p>
    </div>
  );
}

export function Overview() {
  const { profile } = useAuth();
  const cases = useCases();
  const reviews = useReviews();
  return (
    <DashboardOverview
      profile={profile}
      cases={cases.data}
      reviews={reviews.data}
      casesLoading={cases.isPending}
      reviewsLoading={reviews.isPending}
      casesError={cases.error}
      reviewsError={reviews.error}
      refreshing={cases.isFetching || reviews.isFetching}
      onRefresh={() => {
        void cases.refetch();
        void reviews.refetch();
      }}
    />
  );
}
