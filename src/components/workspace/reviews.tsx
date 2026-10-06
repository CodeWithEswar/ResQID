"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Search01Icon,
  FilterHorizontalIcon,
  GridViewIcon,
  ListViewIcon,
  RefreshIcon,
  EyeIcon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Cancel01Icon,
  Location01Icon,
  Calendar03Icon,
  Shield01Icon,
  Image01Icon,
  Maximize01Icon,
  Folder01Icon,
  Clock01Icon,
  Camera01Icon,
} from "hugeicons-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useReviews } from "@/hooks/use-workspace";
import { useIsMobile } from "@/hooks/use-mobile";
import { api } from "@/lib/api";
import type { Review } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { GradientAvatar } from "@/components/ui/gradient-avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ErrorMessage, Status, dateLabel, EmptyState, PageHeading, Loading } from "./shared";
import styles from "./reviews.module.css";

type ReviewSort = "score_desc" | "score_asc" | "newest" | "oldest" | "name_asc";
type ScoreFilter = "all" | "high" | "medium" | "low";
type TimeFilter = "all" | "1" | "7" | "30";

function scoreGradient(score: number) {
  if (score >= 0.9) return "linear-gradient(90deg, #10b981, #059669)";
  if (score >= 0.8) return "linear-gradient(90deg, #8b5cf6, #7c3aed)";
  if (score >= 0.7) return "linear-gradient(90deg, #f59e0b, #d97706)";
  return "linear-gradient(90deg, #ef4444, #dc2626)";
}

export function Reviews() {
  const query = useReviews();
  const client = useQueryClient();
  const { profile } = useAuth();
  const isMobile = useIsMobile();

  // Active filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [sort, setSort] = useState<ReviewSort>("score_desc");
  const [view, setView] = useState<"table" | "grid">("table");

  // Filter sheet/drawer modal state
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState<string>("all");
  const [draftScore, setDraftScore] = useState<ScoreFilter>("all");
  const [draftTime, setDraftTime] = useState<TimeFilter>("all");
  const [draftSort, setDraftSort] = useState<ReviewSort>("score_desc");

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Inspector & decision state
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [decision, setDecision] = useState<"verified" | "rejected">("verified");
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Full-resolution photographic inspection lightbox
  const [lightbox, setLightbox] = useState<{
    review: Review;
    photoUrl: string;
    type: "search" | "case";
  } | null>(null);
  const [lightboxMode, setLightboxMode] = useState<"case" | "search" | "split">("case");

  // Decision mutation
  const saveDecision = useMutation({
    mutationFn: () => {
      if (!selectedReview) throw new Error("No review selected.");
      return api(`/api/reviews/${encodeURIComponent(selectedReview.id)}`, {
        method: "POST",
        body: JSON.stringify({ decision, reason: reason.trim() }),
      });
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["reviews"] });
      toast.success(
        decision === "verified" ? "Lead verified" : "Lead rejected",
        {
          description:
            decision === "verified"
              ? "Candidate match confirmed and added to verified records."
              : "Candidate lead dismissed and archived.",
        }
      );
      setConfirmOpen(false);
      setInspectorOpen(false);
      setSelectedReview(null);
      setReason("");
    },
    onError: (err: Error) => {
      toast.error("Failed to record decision", {
        description: err.message || "An error occurred while signing review audit.",
      });
    },
  });

  const reviews = query.data ?? [];

  // Filter and sort reviews
  const filtered = useMemo(() => {
    let result = [...reviews];

    // Search filter
    const queryTerm = search.trim().toLowerCase();
    if (queryTerm) {
      result = result.filter((r) => {
        const name = r.persons?.name?.toLowerCase() || "";
        const location = r.persons?.last_seen?.toLowerCase() || "";
        const notes = r.persons?.notes?.toLowerCase() || "";
        const id = r.person_id?.toLowerCase() || "";
        return (
          name.includes(queryTerm) ||
          location.includes(queryTerm) ||
          notes.includes(queryTerm) ||
          id.includes(queryTerm)
        );
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Score filter
    if (scoreFilter === "high") {
      result = result.filter((r) => r.score >= 0.9);
    } else if (scoreFilter === "medium") {
      result = result.filter((r) => r.score >= 0.75 && r.score < 0.9);
    } else if (scoreFilter === "low") {
      result = result.filter((r) => r.score < 0.75);
    }

    // Time filter
    if (timeFilter !== "all") {
      const days = Number(timeFilter);
      const cutoff = new Date(Date.now() - days * 86_400_000);
      result = result.filter((r) => new Date(r.created_at) >= cutoff);
    }

    // Sort
    result.sort((a, b) => {
      if (sort === "score_desc") return b.score - a.score;
      if (sort === "score_asc") return a.score - b.score;
      if (sort === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sort === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sort === "name_asc") {
        const nameA = a.persons?.name || "";
        const nameB = b.persons?.name || "";
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

    return result;
  }, [reviews, search, statusFilter, scoreFilter, timeFilter, sort]);

  // Pagination calculation
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pagedReviews = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Summary counts
  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const verifiedCount = reviews.filter((r) => r.status === "verified").length;
  const rejectedCount = reviews.filter((r) => r.status === "rejected").length;

  const activeFiltersCount =
    (search ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (scoreFilter !== "all" ? 1 : 0) +
    (timeFilter !== "all" ? 1 : 0);

  const clearAllFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("all");
    setScoreFilter("all");
    setTimeFilter("all");
    setSort("score_desc");
    setPage(1);
    toast.info("Filters reset", { description: "Showing all items in review queue." });
  }, []);

  const openFilterModal = () => {
    setDraftStatus(statusFilter);
    setDraftScore(scoreFilter);
    setDraftTime(timeFilter);
    setDraftSort(sort);
    setFilterModalOpen(true);
  };

  const applyModalFilters = () => {
    setStatusFilter(draftStatus);
    setScoreFilter(draftScore);
    setTimeFilter(draftTime);
    setSort(draftSort);
    setPage(1);
    setFilterModalOpen(false);
    toast.success("Filters applied", {
      description: "Review queue updated with selected criteria.",
    });
  };

  const openInspector = useCallback((review: Review) => {
    setSelectedReview(review);
    setDecision("verified");
    setReason("");
    setInspectorOpen(true);
  }, []);

  const canReview =
    Boolean(profile && ["admin", "verifier"].includes(profile.role)) &&
    selectedReview?.status === "pending";

  const refreshReviews = async () => {
    await query.refetch();
    toast.success("Review queue refreshed", {
      description: "Viewing the latest available candidate records.",
    });
  };

  // Filter Modal Content (used in Sheet on desktop, Drawer on mobile)
  const filterModalContent = (
    <div className={styles.filterModalBody}>
      {/* Status section */}
      <div className={styles.filterFieldset}>
        <span className={styles.filterLegend}>Review Status</span>
        <div className="grid grid-cols-1 gap-2">
          {[
            { id: "all", label: "All Statuses", count: reviews.length },
            { id: "pending", label: "Pending Review", count: pendingCount },
            { id: "verified", label: "Verified Leads", count: verifiedCount },
            { id: "rejected", label: "Rejected / Dismissed", count: rejectedCount },
          ].map((item) => (
            <label
              key={item.id}
              className={`${styles.statusOption} ${draftStatus === item.id ? "border-violet-500/50 bg-violet-500/10" : ""}`}
            >
              <div className="flex items-center gap-2.5">
                <Checkbox
                  checked={draftStatus === item.id}
                  onCheckedChange={() => setDraftStatus(item.id)}
                />
                <span className="text-xs font-medium text-zinc-200">{item.label}</span>
              </div>
              <span className="font-mono text-xs text-zinc-500">{item.count}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Confidence threshold */}
      <div className={styles.filterFieldset}>
        <span className={styles.filterLegend}>Confidence Tier</span>
        <Select
          value={draftScore}
          onValueChange={(val) => setDraftScore(val as ScoreFilter)}
        >
          <SelectTrigger className="bg-zinc-950 border-white/10 text-xs h-11">
            <SelectValue placeholder="Select confidence tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Confidence Tiers</SelectItem>
            <SelectItem value="high">High Confidence (≥ 90%)</SelectItem>
            <SelectItem value="medium">Medium Match (75% – 89%)</SelectItem>
            <SelectItem value="low">Borderline Match (&lt; 75%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Time frame */}
      <div className={styles.filterFieldset}>
        <span className={styles.filterLegend}>Registration / Discovered Time</span>
        <Select
          value={draftTime}
          onValueChange={(val) => setDraftTime(val as TimeFilter)}
        >
          <SelectTrigger className="bg-zinc-950 border-white/10 text-xs h-11">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Time</SelectItem>
            <SelectItem value="1">Last 24 Hours</SelectItem>
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sort order */}
      <div className={styles.filterFieldset}>
        <span className={styles.filterLegend}>Sort Order</span>
        <Select
          value={draftSort}
          onValueChange={(val) => setDraftSort(val as ReviewSort)}
        >
          <SelectTrigger className="bg-zinc-950 border-white/10 text-xs h-11">
            <SelectValue placeholder="Sort records" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score_desc">Highest Similarity First</SelectItem>
            <SelectItem value="score_asc">Lowest Similarity First</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="name_asc">Candidate Name (A–Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-3 border-t border-white/[.08]">
        <Button
          variant="outline"
          className="flex-1 h-11 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
          onClick={() => {
            setDraftStatus("all");
            setDraftScore("all");
            setDraftTime("all");
            setDraftSort("score_desc");
          }}
        >
          Reset
        </Button>
        <Button
          className="flex-1 h-11 bg-violet-600 hover:bg-violet-500 text-white font-semibold border-violet-500 shadow-md shadow-violet-600/20"
          onClick={applyModalFilters}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );

  // Inspector Content (rendered in Sheet on desktop, Drawer on mobile)
  const inspectorContent = selectedReview && (
    <div className={styles.inspectorBody}>
      {/* Photographic Evidence Side-by-Side Comparison */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
          <Image01Icon size={15} className="text-violet-400" /> Photographic Comparison
        </h4>
        <div className={styles.inspectorPhotos}>
          {/* Query Photo */}
          <div className={styles.inspectorPhotoCard}>
            <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
              <span>Query Search Photo</span>
              {selectedReview.search_photo_url && (
                <a
                  href={selectedReview.search_photo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] text-violet-300 hover:text-violet-200"
                >
                  <Maximize01Icon size={12} /> Open original
                </a>
              )}
            </div>
            {selectedReview.search_photo_url ? (
              <button
                type="button"
                onClick={() => {
                  setLightbox({
                    review: selectedReview,
                    photoUrl: selectedReview.search_photo_url!,
                    type: "search",
                  });
                  setLightboxMode(selectedReview.case_photo_url ? "split" : "search");
                }}
                title="Click to view full uncropped query photograph in lightbox"
                className="block w-full group overflow-hidden rounded-lg cursor-zoom-in text-left p-0 border-0 bg-transparent"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedReview.search_photo_url}
                  alt="Search query photograph"
                  className="transition-transform duration-200 group-hover:scale-[1.02]"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </button>
            ) : (
              <div className={styles.inspectorPhotoPlaceholder}>
                <Camera01Icon size={26} className="text-zinc-600 mb-1" />
                <span className="font-medium text-zinc-400">Probe photo not archived</span>
                <span className="text-[10px] text-zinc-600 max-w-[200px]">
                  Candidate matched using facial feature embedding
                </span>
              </div>
            )}
            <span className="text-[10px] text-zinc-500">Provided during search probe</span>
          </div>

          {/* Reference Photo */}
          <div className={styles.inspectorPhotoCard}>
            <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
              <span>Case Reference Photo</span>
              {selectedReview.case_photo_url && (
                <a
                  href={selectedReview.case_photo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[11px] text-violet-300 hover:text-violet-200"
                >
                  <Maximize01Icon size={12} /> Open original
                </a>
              )}
            </div>
            {selectedReview.case_photo_url ? (
              <button
                type="button"
                onClick={() => {
                  setLightbox({
                    review: selectedReview,
                    photoUrl: selectedReview.case_photo_url!,
                    type: "case",
                  });
                  setLightboxMode(selectedReview.search_photo_url ? "split" : "case");
                }}
                title="Click to view full uncropped reference photograph in lightbox"
                className="block w-full group overflow-hidden rounded-lg cursor-zoom-in text-left p-0 border-0 bg-transparent"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedReview.case_photo_url}
                  alt="Case reference photograph"
                  className="transition-transform duration-200 group-hover:scale-[1.02]"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </button>
            ) : (
              <div className={styles.inspectorPhotoPlaceholder}>
                <Camera01Icon size={26} className="text-zinc-600 mb-1" />
                <span className="font-medium text-zinc-400">Reference unavailable</span>
                <span className="text-[10px] text-zinc-600 max-w-[200px]">
                  No reference portrait enrolled for this case
                </span>
              </div>
            )}
            <span className="text-[10px] text-zinc-500">Enrolled official record</span>
          </div>
        </div>
      </div>

      {/* Case Details and Component Metrics */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          Forensic Metrics & Record Details
        </h4>
        <dl className={styles.detailsList}>
          <div>
            <dt>Similarity Score</dt>
            <dd className="font-mono text-violet-300 font-semibold">
              {selectedReview.score.toFixed(4)}
            </dd>
          </div>
          <div>
            <dt>Recorded Date</dt>
            <dd>{dateLabel(selectedReview.created_at)}</dd>
          </div>
          <div>
            <dt>Case ID</dt>
            <dd className="font-mono text-xs truncate">{selectedReview.person_id}</dd>
          </div>
          <div>
            <dt>Review ID</dt>
            <dd className="font-mono text-xs truncate">{selectedReview.id}</dd>
          </div>
          {Object.entries(selectedReview.components || {}).map(([key, val]) => (
            <div key={key}>
              <dt>{key.replaceAll("_", " ")}</dt>
              <dd className="font-mono text-xs">
                {typeof val === "number" ? val.toFixed(4) : "—"}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl border border-white/[.06] bg-white/[.02] text-xs">
        <span className="text-zinc-400">View official case file in registry:</span>
        <Button asChild variant="link" size="sm" className="text-violet-300 p-0 h-auto">
          <Link href={`/cases/${selectedReview.person_id}`}>
            Open case file <ArrowRight01Icon size={13} className="ml-1" />
          </Link>
        </Button>
      </div>

      {/* Independent Decision Action Panel */}
      <div className={styles.decisionPanel}>
        <div className="flex items-center gap-2">
          <Shield01Icon size={18} className="text-violet-400" />
          <h4 className="text-sm font-semibold text-zinc-100">Independent Review Decision</h4>
        </div>
        <p className="text-xs leading-5 text-zinc-400">
          A similarity score is not an identity probability. An authorized team verifier must
          evaluate visual evidence and record reasons.
        </p>

        {canReview ? (
          <div className="flex flex-col gap-3 mt-1">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="decision-select" className="text-xs font-medium text-zinc-300">
                Decision Outcome
              </label>
              <Select
                value={decision}
                onValueChange={(val) => setDecision(val as "verified" | "rejected")}
              >
                <SelectTrigger id="decision-select" className="bg-zinc-900 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified">Verify Lead (Confirmed Identity)</SelectItem>
                  <SelectItem value="rejected">Reject Lead (Dismiss Match)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="decision-reason" className="text-xs font-medium text-zinc-300">
                Reason & Findings
              </label>
              <textarea
                id="decision-reason"
                required
                minLength={3}
                maxLength={2000}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the visual evidence or corroborating factors behind this decision..."
                className="w-full min-h-[90px] rounded-lg border border-zinc-700 bg-zinc-950 p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <span className="text-[10px] text-zinc-500 text-right">
                {reason.length} / 2000 characters
              </span>
            </div>

            <Button
              className="mt-1 w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold h-11 border-violet-500 shadow-lg shadow-violet-600/30"
              disabled={reason.trim().length < 3}
              onClick={() => setConfirmOpen(true)}
            >
              Record Official Decision
            </Button>
          </div>
        ) : (
          <div className="rounded-lg bg-zinc-900/80 border border-white/[.06] p-3 text-xs text-zinc-400">
            {selectedReview.status !== "pending" ? (
              <span className="flex items-center gap-2 text-emerald-400">
                <CheckmarkCircle01Icon size={16} /> Decision already recorded as{" "}
                <strong className="capitalize">{selectedReview.status}</strong>.
              </span>
            ) : (
              <span className="flex items-center gap-2 text-amber-400">
                <AlertCircleIcon size={16} /> Verifier or Administrator access required to record
                decisions.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.reviews}>
      {/* Responsive Header: Heading and Action in one row, Subheading beneath */}
      <header className={styles.header}>
        <p className={styles.eyebrow}>
          REVIEW WORKSPACE
        </p>
        <h1 className={styles.heading}>
          Evidence before a decision.
        </h1>
        <Button
          variant="outline"
          size="sm"
          disabled={query.isFetching}
          onClick={() => void refreshReviews()}
          className={`${styles.headerAction} gap-2 h-10 border-white/10 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200`}
          aria-label="Refresh review queue"
        >
          <RefreshIcon
            size={15}
            className={query.isFetching ? "animate-spin" : ""}
            aria-hidden="true"
          />
          <span className={styles.actionFull}>Refresh queue</span>
          <span className={styles.actionShort}>Refresh</span>
        </Button>
        <p className={styles.subtitle}>
          Compare potential leads, inspect biometric evidence side-by-side, and record independent, audited decisions.
        </p>
      </header>

      {/* Interactive Stats Summary Bar (Clicking any stat filters the queue) */}
      <div className={styles.stats}>
        <button
          type="button"
          className={`${styles.stat} ${statusFilter === "all" ? styles.statActive : ""}`}
          onClick={() => {
            setStatusFilter("all");
            setPage(1);
          }}
          aria-label="Filter by all items"
        >
          <div className="flex items-center justify-between">
            <span className={styles.statLabel}>Total In Queue</span>
            <Folder01Icon size={16} className="text-violet-400" />
          </div>
          <div className={styles.statValue}>
            {reviews.length}
            <small className="text-xs font-normal text-zinc-500">leads</small>
          </div>
        </button>

        <button
          type="button"
          className={`${styles.stat} ${statusFilter === "pending" ? styles.statActive : ""}`}
          onClick={() => {
            setStatusFilter(statusFilter === "pending" ? "all" : "pending");
            setPage(1);
          }}
          aria-label="Filter by pending review"
        >
          <div className="flex items-center justify-between">
            <span className={styles.statLabel}>Pending Review</span>
            <AlertCircleIcon size={16} className="text-amber-400" />
          </div>
          <div className={styles.statValue}>
            {pendingCount}
            <small className="text-xs font-normal text-amber-500/80">awaiting action</small>
          </div>
        </button>

        <button
          type="button"
          className={`${styles.stat} ${statusFilter === "verified" ? styles.statActive : ""}`}
          onClick={() => {
            setStatusFilter(statusFilter === "verified" ? "all" : "verified");
            setPage(1);
          }}
          aria-label="Filter by verified leads"
        >
          <div className="flex items-center justify-between">
            <span className={styles.statLabel}>Verified Leads</span>
            <CheckmarkCircle01Icon size={16} className="text-emerald-400" />
          </div>
          <div className={styles.statValue}>
            {verifiedCount}
            <small className="text-xs font-normal text-emerald-500/80">confirmed</small>
          </div>
        </button>

        <button
          type="button"
          className={`${styles.stat} ${statusFilter === "rejected" ? styles.statActive : ""}`}
          onClick={() => {
            setStatusFilter(statusFilter === "rejected" ? "all" : "rejected");
            setPage(1);
          }}
          aria-label="Filter by rejected leads"
        >
          <div className="flex items-center justify-between">
            <span className={styles.statLabel}>Rejected / Dismissed</span>
            <Cancel01Icon size={16} className="text-zinc-400" />
          </div>
          <div className={styles.statValue}>
            {rejectedCount}
            <small className="text-xs font-normal text-zinc-500">dismissed</small>
          </div>
        </button>
      </div>

      {/* Main Review Surface with Professional Filter Bar */}
      <div className={styles.surface}>
        <div className={styles.filterPanel}>
          {/* Main Toolbar Controls */}
          <div className={styles.toolbar}>
            {/* Search Input */}
            <div className={styles.searchBox}>
              <Input
                icon={<Search01Icon size={16} aria-hidden="true" />}
                placeholder="Search candidate name, location, or notes..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                endIcon={
                  search ? (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => {
                        setSearch("");
                        setPage(1);
                      }}
                      className="hover:text-white"
                    >
                      <Cancel01Icon size={14} />
                    </button>
                  ) : null
                }
                className="h-11 bg-zinc-950/80 border-white/10 text-xs"
              />
            </div>

            {/* Dedicated Professional Filters Button */}
            <Button
              variant="outline"
              className="h-11 gap-2 border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-xs text-zinc-200"
              onClick={openFilterModal}
              aria-label="Open advanced filter drawer"
            >
              <FilterHorizontalIcon size={16} className="text-violet-400" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </Button>

            {/* Quick Inline Dropdowns on Desktop/Tablet */}
            <div className={styles.quickDropdowns}>
              {/* Status Filter Dropdown */}
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[145px] h-11 bg-zinc-950/80 border-white/10 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="verified">Verified Leads</SelectItem>
                  <SelectItem value="rejected">Rejected Leads</SelectItem>
                </SelectContent>
              </Select>

              {/* Similarity Score Filter Dropdown */}
              <Select
                value={scoreFilter}
                onValueChange={(val) => {
                  setScoreFilter(val as ScoreFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[155px] h-11 bg-zinc-950/80 border-white/10 text-xs">
                  <SelectValue placeholder="Confidence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Confidence</SelectItem>
                  <SelectItem value="high">High Match (≥ 90%)</SelectItem>
                  <SelectItem value="medium">Medium (75%–89%)</SelectItem>
                  <SelectItem value="low">Borderline (&lt; 75%)</SelectItem>
                </SelectContent>
              </Select>

              {/* Timeframe Filter Dropdown */}
              <Select
                value={timeFilter}
                onValueChange={(val) => {
                  setTimeFilter(val as TimeFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[140px] h-11 bg-zinc-950/80 border-white/10 text-xs">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Time</SelectItem>
                  <SelectItem value="1">Last 24 Hours</SelectItem>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Dropdown */}
              <Select
                value={sort}
                onValueChange={(val) => {
                  setSort(val as ReviewSort);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[160px] h-11 bg-zinc-950/80 border-white/10 text-xs">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score_desc">Highest Similarity</SelectItem>
                  <SelectItem value="score_asc">Lowest Similarity</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name_asc">Name (A–Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions: Segmented View Switch & Refresh */}
            <div className={styles.toolbarActions}>
              <div
                role="group"
                aria-label="View mode toggle"
                className={styles.viewGroup}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className={`size-9 rounded-md ${
                    view === "table"
                      ? "bg-violet-600/25 text-violet-300 font-semibold shadow-xs"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                  onClick={() => setView("table")}
                  title="Row / Table view"
                  aria-label="Table view"
                  aria-pressed={view === "table"}
                >
                  <ListViewIcon size={17} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className={`size-9 rounded-md ${
                    view === "grid"
                      ? "bg-violet-600/25 text-violet-300 font-semibold shadow-xs"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                  onClick={() => setView("grid")}
                  title="Card / Grid view"
                  aria-label="Grid view"
                  aria-pressed={view === "grid"}
                >
                  <GridViewIcon size={17} />
                </Button>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="size-11 border-white/10 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300"
                onClick={() => void refreshReviews()}
                disabled={query.isFetching}
                title="Refresh leads"
                aria-label="Refresh leads"
              >
                <RefreshIcon
                  size={16}
                  className={query.isFetching ? "animate-spin" : ""}
                />
              </Button>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFiltersCount > 0 && (
            <div className={styles.chips}>
              <span className="text-xs text-zinc-500">Active filters:</span>
              {search && (
                <button
                  type="button"
                  className={styles.chip}
                  onClick={() => setSearch("")}
                >
                  Search: {search} <Cancel01Icon size={12} />
                </button>
              )}
              {statusFilter !== "all" && (
                <button
                  type="button"
                  className={styles.chip}
                  onClick={() => setStatusFilter("all")}
                >
                  Status: {statusFilter} <Cancel01Icon size={12} />
                </button>
              )}
              {scoreFilter !== "all" && (
                <button
                  type="button"
                  className={styles.chip}
                  onClick={() => setScoreFilter("all")}
                >
                  Confidence: {scoreFilter} <Cancel01Icon size={12} />
                </button>
              )}
              {timeFilter !== "all" && (
                <button
                  type="button"
                  className={styles.chip}
                  onClick={() => setTimeFilter("all")}
                >
                  Time: Last {timeFilter}d <Cancel01Icon size={12} />
                </button>
              )}
              <button
                type="button"
                className={styles.clearAllChips}
                onClick={clearAllFilters}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Results Metadata Bar */}
        <div className={styles.metaBar}>
          <span>
            Showing <strong className="text-zinc-200">{filtered.length}</strong>{" "}
            {filtered.length === 1 ? "lead" : "leads"}
            {activeFiltersCount > 0 ? " matching active filters" : " in queue"}
          </span>
          <span className="text-zinc-500 text-xs">
            Page {currentPage} of {pageCount}
          </span>
        </div>

        <ErrorMessage error={query.error} />

        {/* Content View: Loading, Empty, Table, or Grid */}
        {query.isPending ? (
          <div className="p-8">
            <Loading label="Loading review queue records…" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title={reviews.length ? "No leads match your filter" : "The review queue is clear"}
              description={
                reviews.length
                  ? "Try clearing or adjusting your search criteria, status, or confidence threshold."
                  : "Search candidates will appear here for your team to inspect and verify."
              }
              artwork="dashboard/review"
              action={
                reviews.length ? (
                  <Button variant="outline" onClick={clearAllFilters}>
                    Clear filters
                  </Button>
                ) : (
                  <Button asChild className="bg-violet-600 hover:bg-violet-500 text-white font-semibold">
                    <Link href="/dashboard?tab=search">Initiate face search</Link>
                  </Button>
                )
              }
            />
          </div>
        ) : view === "table" ? (
          <>
            {/* Table View (Desktop & Tablet) */}
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Case Lead</th>
                    <th>Similarity Match</th>
                    <th>Evidence Check</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedReviews.map((review) => {
                    const pct = Math.round(review.score * 100);
                    return (
                      <tr key={review.id}>
                        {/* Case Lead Avatar & Name */}
                        <td>
                          <div className={styles.candidateCell}>
                            <GradientAvatar
                              name={review.persons?.name || "Lead"}
                              id={review.person_id}
                              photo={review.case_photo_url || review.search_photo_url}
                              size="md"
                            />
                            <div className={styles.candidateMeta}>
                              <strong className={styles.candidateName}>
                                {review.persons?.name || "Unassigned Lead"}
                              </strong>
                              <span className={styles.candidateLocation}>
                                <Location01Icon size={12} className="shrink-0 text-zinc-500" />
                                {review.persons?.last_seen || "Location not recorded"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Similarity Meter */}
                        <td>
                          <div className={styles.scoreMeter}>
                            <div className={styles.scoreTop}>
                              <span className={styles.scoreNumber}>{review.score.toFixed(3)}</span>
                              <span className={styles.scorePercent}>{pct}% match</span>
                            </div>
                            <div className={styles.scoreBarTrack}>
                              <div
                                className={styles.scoreBarFill}
                                style={{
                                  width: `${Math.min(100, Math.max(0, pct))}%`,
                                  background: scoreGradient(review.score),
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Evidence Check */}
                        <td>
                          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                review.search_photo_url
                                    ? "bg-violet-500/15 text-violet-300 border border-violet-500/20"
                                    : "bg-zinc-800 text-zinc-500"
                              }`}
                            >
                              Search Photo
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                review.case_photo_url
                                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                                    : "bg-zinc-800 text-zinc-500"
                              }`}
                            >
                              Case Ref
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td>
                          <Status value={review.status} />
                        </td>

                        {/* Date */}
                        <td className="whitespace-nowrap text-xs text-zinc-400">
                          {dateLabel(review.created_at)}
                        </td>

                        {/* Action Button */}
                        <td style={{ textAlign: "right" }}>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="gap-1.5 h-9 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700 text-xs"
                            onClick={() => openInspector(review)}
                          >
                            <EyeIcon size={14} /> Review evidence
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Compact Card List (visible on small mobile screens in table mode) */}
            <div className={styles.compactList}>
              {pagedReviews.map((review) => {
                const pct = Math.round(review.score * 100);
                return (
                  <div key={review.id} className={styles.compactItem}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <GradientAvatar
                          name={review.persons?.name || "Lead"}
                          id={review.person_id}
                          photo={review.case_photo_url || review.search_photo_url}
                          size="md"
                        />
                        <div className="min-w-0">
                          <strong className="block text-sm text-zinc-100 truncate">
                            {review.persons?.name || "Case Lead"}
                          </strong>
                          <span className="text-xs text-zinc-400 flex items-center gap-1 truncate">
                            <Location01Icon size={12} className="shrink-0 text-zinc-500" />
                            {review.persons?.last_seen || "Location not recorded"}
                          </span>
                        </div>
                      </div>
                      <Status value={review.status} />
                    </div>

                    <div className={styles.scoreMeter}>
                      <div className={styles.scoreTop}>
                        <span className="text-xs text-zinc-400">Similarity</span>
                        <span className={styles.scoreNumber}>
                          {review.score.toFixed(3)} ({pct}%)
                        </span>
                      </div>
                      <div className={styles.scoreBarTrack}>
                        <div
                          className={styles.scoreBarFill}
                          style={{
                            width: `${pct}%`,
                            background: scoreGradient(review.score),
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-zinc-500">
                        {dateLabel(review.created_at)}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 gap-1.5 text-xs bg-zinc-800"
                        onClick={() => openInspector(review)}
                      >
                        <EyeIcon size={13} /> Review evidence
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Card / Grid View */
          <div className={styles.cards}>
            {pagedReviews.map((review) => {
              const pct = Math.round(review.score * 100);
              return (
                <div key={review.id} className={styles.card}>
                  {/* Card Header */}
                  <div className={styles.cardHeader}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <GradientAvatar
                        name={review.persons?.name || "Lead"}
                        id={review.person_id}
                        photo={review.case_photo_url || review.search_photo_url}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <strong className="block text-sm text-zinc-100 truncate">
                          {review.persons?.name || "Case Lead"}
                        </strong>
                        <span className="flex items-center gap-1 text-[11px] text-zinc-400 truncate">
                          <Location01Icon size={11} className="shrink-0 text-zinc-500" />
                          {review.persons?.last_seen || "Location not recorded"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Status value={review.status} />
                      <span className="font-mono text-[10px] font-bold text-violet-300 bg-violet-400/10 border border-violet-400/20 px-2 py-0.5 rounded-full">
                        {pct}% match
                      </span>
                    </div>
                  </div>

                  {/* Side-by-Side Photographic Preview */}
                  <div className={styles.evidencePreview}>
                    <div className={styles.evidenceThumb}>
                      {review.search_photo_url ? (
                        <button
                          type="button"
                          onClick={() => {
                            setLightbox({
                              review,
                              photoUrl: review.search_photo_url!,
                              type: "search",
                            });
                            setLightboxMode(review.case_photo_url ? "split" : "search");
                          }}
                          className={styles.evidencePhotoFrame}
                          title="Click to view full uncropped query photograph"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={review.search_photo_url}
                            alt="Search query"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <span className={styles.photoZoomHint}>
                            <Maximize01Icon size={11} />
                            <span>Zoom</span>
                          </span>
                        </button>
                      ) : (
                        <div className={styles.evidencePlaceholder}>
                          <Camera01Icon size={18} className="text-zinc-600 mb-0.5" />
                          <span>No search photo</span>
                        </div>
                      )}
                      <span className={styles.evidenceLabel}>Search Photo</span>
                    </div>

                    <div className={styles.evidenceThumb}>
                      {review.case_photo_url ? (
                        <button
                          type="button"
                          onClick={() => {
                            setLightbox({
                              review,
                              photoUrl: review.case_photo_url!,
                              type: "case",
                            });
                            setLightboxMode(review.search_photo_url ? "split" : "case");
                          }}
                          className={styles.evidencePhotoFrame}
                          title="Click to view full uncropped reference photograph"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={review.case_photo_url}
                            alt="Case reference"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <span className={styles.photoZoomHint}>
                            <Maximize01Icon size={11} />
                            <span>Zoom</span>
                          </span>
                        </button>
                      ) : (
                        <div className={styles.evidencePlaceholder}>
                          <Camera01Icon size={18} className="text-zinc-600 mb-0.5" />
                          <span>No reference</span>
                        </div>
                      )}
                      <span className={styles.evidenceLabel}>Case Reference</span>
                    </div>
                  </div>

                  {/* Score Progress Meter */}
                  <div className={styles.scoreMeter}>
                    <div className={styles.scoreTop}>
                      <span className="text-[11px] text-zinc-400">Score Metric</span>
                      <span className={styles.scoreNumber}>{review.score.toFixed(3)}</span>
                    </div>
                    <div className={styles.scoreBarTrack}>
                      <div
                        className={styles.scoreBarFill}
                        style={{
                          width: `${pct}%`,
                          background: scoreGradient(review.score),
                        }}
                      />
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="flex items-center justify-between border-t border-white/[.06] pt-3">
                    <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                      <Calendar03Icon size={12} /> {dateLabel(review.created_at)}
                    </span>
                    <Button
                      size="sm"
                      className="gap-1 text-xs bg-violet-600 hover:bg-violet-500 text-white h-8 border-violet-500 font-semibold"
                      onClick={() => openInspector(review)}
                    >
                      Inspect <ArrowRight01Icon size={13} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {filtered.length > 0 && (
          <footer className={styles.pagination}>
            <span className="text-xs text-zinc-400">
              {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} leads
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[105px] h-9 text-xs bg-zinc-950 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[12, 24, 48].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                className="size-9 border-white/10"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
                aria-label="Previous page"
              >
                <ArrowLeft01Icon size={15} />
              </Button>

              <span className="min-w-10 text-center text-xs tabular-nums text-zinc-400">
                {currentPage} / {pageCount}
              </span>

              <Button
                variant="outline"
                size="icon"
                className="size-9 border-white/10"
                disabled={currentPage === pageCount}
                onClick={() => setPage(currentPage + 1)}
                aria-label="Next page"
              >
                <ArrowRight01Icon size={15} />
              </Button>
            </div>
          </footer>
        )}
      </div>

      {/* Filter Sheet (Desktop) or Drawer (Mobile) */}
      {isMobile ? (
        <Drawer open={filterModalOpen} onOpenChange={setFilterModalOpen}>
          <DrawerContent className="max-h-[85vh] p-0 flex flex-col overflow-hidden bg-zinc-950">
            <div className="shrink-0 px-5 pt-3 pb-3 border-b border-white/[.08] bg-zinc-950">
              <DrawerTitle className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <FilterHorizontalIcon size={18} className="text-violet-400" />
                Filter Review Queue
              </DrawerTitle>
              <DrawerDescription className="text-xs text-zinc-400 mt-0.5">
                Refine leads by status, confidence tier, timeframe, and sorting.
              </DrawerDescription>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {filterModalContent}
            </div>
            <div className="shrink-0 px-5 pb-5 pt-2 border-t border-white/[.06] bg-zinc-950">
              <DrawerClose asChild>
                <Button variant="ghost" className="w-full text-xs text-zinc-400">
                  Cancel
                </Button>
              </DrawerClose>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={filterModalOpen} onOpenChange={setFilterModalOpen}>
          <SheetContent
            side="right"
            className="w-full sm:max-w-md p-0 flex flex-col h-full overflow-hidden bg-zinc-950 border-zinc-800"
          >
            <div className="shrink-0 p-6 pb-4 border-b border-white/[.08] pr-14 bg-zinc-950/95 backdrop-blur-md">
              <SheetTitle className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <FilterHorizontalIcon size={18} className="text-violet-400" />
                Filter Review Queue
              </SheetTitle>
              <SheetDescription className="text-xs text-zinc-400 mt-1">
                Refine leads by status, confidence tier, timeframe, and sorting.
              </SheetDescription>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              {filterModalContent}
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Inspector Sheet (Desktop) or Drawer (Mobile) */}
      {isMobile ? (
        <Drawer open={inspectorOpen} onOpenChange={setInspectorOpen}>
          <DrawerContent className="max-h-[92vh] p-0 flex flex-col overflow-hidden bg-zinc-950">
            {selectedReview && (
              <div className="shrink-0 px-5 pt-3 pb-3 border-b border-white/[.08] bg-zinc-950">
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider text-violet-400 uppercase mb-2">
                  <Shield01Icon size={13} />
                  <span>Lead Evidence Inspector</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <GradientAvatar
                      name={selectedReview.persons?.name || "Lead"}
                      id={selectedReview.person_id}
                      photo={selectedReview.case_photo_url || selectedReview.search_photo_url}
                      size="md"
                    />
                    <div className="min-w-0">
                      <DrawerTitle className="text-base font-bold text-zinc-100 truncate">
                        {selectedReview.persons?.name || "Case Lead"}
                      </DrawerTitle>
                      <DrawerDescription className="text-xs text-zinc-400 flex items-center gap-1 truncate mt-0.5">
                        <Location01Icon size={12} className="shrink-0 text-violet-400" />
                        {selectedReview.persons?.last_seen || "Location not recorded"}
                      </DrawerDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Status value={selectedReview.status} />
                    <span className="font-mono text-[11px] font-bold text-violet-300 bg-violet-400/10 border border-violet-400/20 px-2 py-0.5 rounded-full">
                      {(selectedReview.score * 100).toFixed(1)}% match
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {inspectorContent}
            </div>
            <div className="shrink-0 px-5 pb-6 pt-2 border-t border-white/[.06] bg-zinc-950">
              <DrawerClose asChild>
                <Button variant="outline" className="w-full h-11">
                  Close Inspector
                </Button>
              </DrawerClose>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={inspectorOpen} onOpenChange={setInspectorOpen}>
          <SheetContent
            side="right"
            className="w-full sm:max-w-xl md:max-w-2xl p-0 flex flex-col h-full overflow-hidden bg-zinc-950 border-zinc-800"
          >
            {selectedReview && (
              <div className="shrink-0 p-6 pb-4 border-b border-white/[.08] pr-14 bg-zinc-950/95 backdrop-blur-md z-20">
                <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-wider text-violet-400 uppercase mb-3">
                  <Shield01Icon size={14} />
                  <span>Lead Evidence Inspector</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <GradientAvatar
                      name={selectedReview.persons?.name || "Lead"}
                      id={selectedReview.person_id}
                      photo={selectedReview.case_photo_url || selectedReview.search_photo_url}
                      size="lg"
                    />
                    <div className="min-w-0">
                      <SheetTitle className="text-xl font-bold text-zinc-100 truncate">
                        {selectedReview.persons?.name || "Case Lead"}
                      </SheetTitle>
                      <SheetDescription className="flex items-center gap-2 text-xs text-zinc-400 mt-1 truncate">
                        <span className="flex items-center gap-1">
                          <Location01Icon size={13} className="shrink-0 text-violet-400" />
                          {selectedReview.persons?.last_seen || "Location not recorded"}
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="font-mono text-[11px] text-zinc-500">
                          ID #{selectedReview.person_id.slice(0, 8)}
                        </span>
                      </SheetDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Status value={selectedReview.status} />
                    <span className="font-mono text-xs font-bold text-violet-300 bg-violet-400/10 border border-violet-400/20 px-2.5 py-0.5 rounded-full">
                      {(selectedReview.score * 100).toFixed(1)}% match
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto p-6 pt-5">
              {inspectorContent}
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Decision Confirmation Alert Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-zinc-950 border-zinc-800">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                decision === "verified"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}
            >
              {decision === "verified" ? (
                <CheckmarkCircle01Icon size={22} />
              ) : (
                <Cancel01Icon size={22} />
              )}
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold text-zinc-100">
                {decision === "verified" ? "Confirm Lead Verification" : "Confirm Lead Dismissal"}
              </AlertDialogTitle>
              <span className="text-xs text-zinc-400">
                Official decision for {selectedReview?.persons?.name || "Case Lead"}
              </span>
            </div>
          </div>

          <AlertDialogDescription className="mt-3 text-sm leading-6 text-zinc-300">
            You are about to record this candidate as{" "}
            <strong
              className={decision === "verified" ? "text-emerald-400" : "text-rose-400"}
            >
              {decision.toUpperCase()}
            </strong>
            .
            <br />
            <span className="text-xs text-zinc-400 mt-2 block bg-zinc-900 p-2.5 rounded-lg border border-white/[.06]">
              <strong>Reason statement:</strong> &ldquo;{reason}&rdquo;
            </span>
            This action creates a permanent audit record signed under your rescuer credentials.
          </AlertDialogDescription>

          <div className="flex items-center justify-end gap-3 mt-4">
            <AlertDialogCancel
              disabled={saveDecision.isPending}
              className="border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={saveDecision.isPending}
              onClick={() => saveDecision.mutate()}
              className={
                decision === "verified"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                  : "bg-rose-600 hover:bg-rose-500 text-white font-semibold"
              }
            >
              {saveDecision.isPending ? "Recording decision…" : "Confirm & Sign Record"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* High-Resolution Photographic Inspection Lightbox Modal */}
      {lightbox && (
        <Dialog open={Boolean(lightbox)} onOpenChange={(open) => !open && setLightbox(null)}>
          <DialogContent className="max-w-4xl w-[94vw] max-h-[92dvh] p-0 bg-[#0c0c10] border border-white/10 overflow-hidden flex flex-col">
            {/* Lightbox Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-[#111116] gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <GradientAvatar
                  name={lightbox.review.persons?.name || "Lead"}
                  id={lightbox.review.person_id}
                  photo={lightbox.review.case_photo_url || lightbox.review.search_photo_url}
                  size="md"
                />
                <div className="min-w-0">
                  <DialogTitle className="text-base font-semibold text-zinc-100 flex items-center gap-2 truncate">
                    {lightbox.review.persons?.name || "Candidate Case Lead"}
                    <span className="font-mono text-xs font-bold text-violet-300 bg-violet-400/10 border border-violet-400/20 px-2 py-0.5 rounded-full">
                      {Math.round(lightbox.review.score * 100)}% match
                    </span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5 truncate">
                    <span className="flex items-center gap-1">
                      <Location01Icon size={12} className="text-zinc-500" />
                      {lightbox.review.persons?.last_seen || "Location not recorded"}
                    </span>
                    <span>·</span>
                    <span>Score: {lightbox.review.score.toFixed(3)}</span>
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2 pr-8">
                <Status value={lightbox.review.status} />
              </div>
            </div>

            {/* Mode / Tabs Switcher */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a0a0e] border-b border-white/5 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5 flex-wrap">
                {lightbox.review.search_photo_url && lightbox.review.case_photo_url && (
                  <button
                    type="button"
                    onClick={() => setLightboxMode("split")}
                    className={cn(
                      "px-3 py-1 rounded-md font-medium transition-colors text-xs",
                      lightboxMode === "split"
                        ? "bg-violet-600 text-white"
                        : "bg-white/5 text-zinc-300 hover:bg-white/10"
                    )}
                  >
                    Side-by-Side Comparison
                  </button>
                )}
                {lightbox.review.case_photo_url && (
                  <button
                    type="button"
                    onClick={() => setLightboxMode("case")}
                    className={cn(
                      "px-3 py-1 rounded-md font-medium transition-colors text-xs",
                      lightboxMode === "case"
                        ? "bg-violet-600 text-white"
                        : "bg-white/5 text-zinc-300 hover:bg-white/10"
                    )}
                  >
                    Case Reference
                  </button>
                )}
                {lightbox.review.search_photo_url && (
                  <button
                    type="button"
                    onClick={() => setLightboxMode("search")}
                    className={cn(
                      "px-3 py-1 rounded-md font-medium transition-colors text-xs",
                      lightboxMode === "search"
                        ? "bg-violet-600 text-white"
                        : "bg-white/5 text-zinc-300 hover:bg-white/10"
                    )}
                  >
                    Search Query
                  </button>
                )}
              </div>

              <span className="text-[11px] text-zinc-500 hidden sm:inline">
                Full uncropped forensic photograph
              </span>
            </div>

            {/* Main Lightbox Viewport */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-[#07070a] flex items-center justify-center min-h-[320px] max-h-[65vh]">
              {lightboxMode === "split" && lightbox.review.search_photo_url && lightbox.review.case_photo_url ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full max-h-[60vh]">
                  <div className="flex flex-col items-center justify-center bg-black/60 rounded-xl p-3 border border-white/10 relative">
                    <span className="absolute top-2 left-2 text-[10px] font-semibold text-zinc-300 uppercase tracking-wider bg-black/80 px-2 py-0.5 rounded border border-white/10 z-10">
                      Query Search Photo
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={lightbox.review.search_photo_url}
                      alt="Search query"
                      className="max-h-[50vh] max-w-full object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center bg-black/60 rounded-xl p-3 border border-white/10 relative">
                    <span className="absolute top-2 left-2 text-[10px] font-semibold text-zinc-300 uppercase tracking-wider bg-black/80 px-2 py-0.5 rounded border border-white/10 z-10">
                      Enrolled Case Reference
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={lightbox.review.case_photo_url}
                      alt="Case reference"
                      className="max-h-[50vh] max-w-full object-contain rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      lightboxMode === "search"
                        ? lightbox.review.search_photo_url || ""
                        : lightbox.review.case_photo_url || lightbox.review.search_photo_url || ""
                    }
                    alt="High-resolution evidence"
                    className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-2xl bg-black/40 border border-white/10"
                  />
                </div>
              )}
            </div>

            {/* Lightbox Footer Actions */}
            <div className="p-3 sm:p-4 bg-[#111116] border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                {(lightboxMode === "case" || lightboxMode === "split") && lightbox.review.case_photo_url && (
                  <a
                    href={lightbox.review.case_photo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-violet-300 hover:text-violet-200 transition-colors"
                  >
                    <Maximize01Icon size={14} /> Open full original in new tab
                  </a>
                )}
                {lightboxMode === "search" && lightbox.review.search_photo_url && (
                  <a
                    href={lightbox.review.search_photo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-violet-300 hover:text-violet-200 transition-colors"
                  >
                    <Maximize01Icon size={14} /> Open query in new tab
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const rev = lightbox.review;
                    setLightbox(null);
                    openInspector(rev);
                  }}
                >
                  Open Inspector Panel
                </Button>
                <Button
                  size="sm"
                  onClick={() => setLightbox(null)}
                  className="bg-violet-600 hover:bg-violet-500 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
