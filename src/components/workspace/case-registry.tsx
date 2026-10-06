"use client";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Search01Icon,
  PlusSignIcon,
  FilterHorizontalIcon,
  GridViewIcon,
  ListViewIcon,
  RefreshIcon,
  Location01Icon,
  EyeIcon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  Folder01Icon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  Archive01Icon,
  Cancel01Icon,
} from "hugeicons-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useCases } from "@/hooks/use-workspace";
import { useIsMobile } from "@/hooks/use-mobile";
import { api } from "@/lib/api";
import type { CaseStatus, Person } from "@/lib/types";
import {
  caseStatuses,
  emptyCaseFilters,
  filterCases,
  type CaseFilters,
  type CaseSort,
} from "@/lib/case-registry-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GradientAvatar } from "@/components/ui/gradient-avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
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
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { ErrorMessage, Status, dateLabel } from "./shared";
import styles from "./case-registry.module.css";

type RegistryProps = {
  cases?: Person[];
  loading?: boolean;
  error?: Error | null;
  refreshing?: boolean;
  canManage?: boolean;
  onRefresh: () => Promise<void>;
  onCloseCase: (person: Person) => Promise<void>;
};
const label = (value: string) => value[0].toUpperCase() + value.slice(1);
const ageLabel = (person: Person) =>
  person.age === null ? "Age not recorded" : `${person.age} years old`;
const ageFilters = {
  all: "Any age",
  child: "Under 18",
  adult: "18 and over",
  unknown: "Age not recorded",
};
function PersonAvatar({
  person,
  large = false,
}: {
  person: Person;
  large?: boolean;
}) {
  return (
    <GradientAvatar
      name={person.name}
      id={person.id}
      size={large ? "xl" : "md"}
      className={large ? "size-14" : "size-10"}
    />
  );
}
function CaseDetails({
  person,
  onCloseCase,
  canManage,
}: {
  person: Person;
  onCloseCase: (person: Person) => void;
  canManage?: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <PersonAvatar person={person} large />
        <div className="min-w-0">
          <p className="text-xs text-zinc-400">{ageLabel(person)}</p>
          <div className="mt-2">
            <Status value={person.status} />
          </div>
        </div>
      </div>
      <dl className={styles.details}>
        <div>
          <dt>Last-seen location</dt>
          <dd>{person.last_seen || "Not recorded"}</dd>
        </div>
        <div>
          <dt>Registered</dt>
          <dd>{dateLabel(person.created_at)}</dd>
        </div>
        <div>
          <dt>Consent / authority</dt>
          <dd>{label(person.consent_basis || "Not recorded")}</dd>
        </div>
        <div>
          <dt>Case ID</dt>
          <dd className="break-all font-mono text-xs!">{person.id}</dd>
        </div>
      </dl>
      <div className="rounded-xl border border-white/[.06] bg-white/[.02] p-4">
        <h3 className="text-xs font-medium text-zinc-300">Case notes</h3>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-400">
          {person.notes || "No notes have been recorded for this case."}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-white/[.06] pt-4">
        <Button
          asChild
          className="h-11 bg-violet-600 text-white hover:bg-violet-500 border-violet-500"
        >
          <Link href={`/cases/${person.id}`}>
            Open full record <ArrowRight01Icon size={16} aria-hidden="true" />
          </Link>
        </Button>
        {canManage && !["closed", "completed"].includes(person.status) && (
          <Button
            variant="ghost"
            className="h-11 text-zinc-400"
            onClick={() => onCloseCase(person)}
          >
            <Archive01Icon size={16} aria-hidden="true" />
            Close case
          </Button>
        )}
      </div>
    </div>
  );
}

export function CaseRegistry({
  cases = [],
  loading,
  error,
  refreshing,
  canManage,
  onRefresh,
  onCloseCase,
}: RegistryProps) {
  const mobile = useIsMobile();
  const filterTrigger = useRef<HTMLButtonElement>(null);
  const previewTrigger = useRef<HTMLButtonElement | null>(null);
  const closeTrigger = useRef<HTMLElement | null>(null);
  const previewHeading = useRef<HTMLHeadingElement | null>(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CaseFilters>(emptyCaseFilters);
  const [draft, setDraft] = useState<CaseFilters>(emptyCaseFilters);
  const [sort, setSort] = useState<CaseSort>("newest");
  const [view, setView] = useState<"table" | "grid">("table");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [closing, setClosing] = useState<Person | null>(null);
  const [closeBusy, setCloseBusy] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);
  const [now] = useState(() => new Date());
  const selected = cases.find((person) => person.id === selectedId);
  const filtered = useMemo(
    () => filterCases(cases, search, filters, sort, now),
    [cases, search, filters, sort, now],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const filterCount =
    filters.statuses.length +
    Number(filters.days > 0) +
    Number(filters.age !== "all");
  const counts = [
    {
      title: "Registered",
      count: cases.length,
      icon: Folder01Icon,
      statuses: [] as CaseStatus[],
      color: "text-violet-300",
    },
    {
      title: "Active cases",
      count: cases.filter((p) =>
        ["pending", "urgent", "ongoing"].includes(p.status),
      ).length,
      icon: Search01Icon,
      statuses: ["pending", "urgent", "ongoing"] as CaseStatus[],
      color: "text-cyan-300",
    },
    {
      title: "Needs attention",
      count: cases.filter((p) => p.status === "urgent").length,
      icon: AlertCircleIcon,
      statuses: ["urgent"] as CaseStatus[],
      color: "text-rose-300",
    },
    {
      title: "Resolved / closed",
      count: cases.filter((p) => ["completed", "closed"].includes(p.status))
        .length,
      icon: CheckmarkCircle01Icon,
      statuses: ["completed", "closed"] as CaseStatus[],
      color: "text-emerald-300",
    },
  ];
  function applyFilters(value: CaseFilters) {
    setFilters(value);
    setPage(1);
  }
  function openFilters() {
    setDraft({ ...filters, statuses: [...filters.statuses] });
    setFilterOpen(true);
  }
  function preview(person: Person, trigger: HTMLButtonElement) {
    previewTrigger.current = trigger;
    setSelectedId(person.id);
    setPreviewOpen(true);
  }
  function requestClose(person: Person) {
    closeTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setCloseError(null);
    setClosing(person);
  }
  async function closeCase() {
    if (!closing || closeBusy) return;
    setCloseBusy(true);
    setCloseError(null);
    try {
      await onCloseCase(closing);
      toast.success("Case closed", {
        description: `${closing.name}'s record remains available in the registry.`,
      });
      setClosing(null);
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "Could not close this case. Try again.";
      setCloseError(message);
      toast.error("Case update failed", { description: message });
    } finally {
      setCloseBusy(false);
    }
  }
  async function refresh() {
    try {
      await onRefresh();
      toast.success("Registry updated", {
        description: "You're viewing the latest available case records.",
      });
    } catch (e) {
      toast.error("Could not refresh cases", {
        description: e instanceof Error ? e.message : "Try again shortly.",
      });
    }
  }
  const restorePreviewFocus = (event: Event) => {
    event.preventDefault();
    previewTrigger.current?.focus();
  };
  const filterFields = (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-3 text-xs font-medium text-zinc-300">
          Case status
        </legend>
        <div className="space-y-2">
          {caseStatuses.map((status) => (
            <label
              key={status}
              className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/[.05] bg-white/[.02] px-3"
            >
              <span className="flex items-center gap-3">
                <Checkbox
                  aria-label={label(status)}
                  checked={draft.statuses.includes(status)}
                  onCheckedChange={(checked) =>
                    setDraft((current) => ({
                      ...current,
                      statuses: checked
                        ? [...current.statuses, status]
                        : current.statuses.filter((value) => value !== status),
                    }))
                  }
                />
                <Status value={status} />
              </span>
              <span className="text-xs tabular-nums text-zinc-500">
                {cases.filter((p) => p.status === status).length}
              </span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          Leave all unchecked to show every status.
        </p>
      </fieldset>
      <label className="field">
        Registration date
        <Select
          value={String(draft.days)}
          onValueChange={(value) =>
            setDraft((current) => ({ ...current, days: Number(value) }))
          }
        >
          <SelectTrigger aria-label="Registration date">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any time</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </label>
      <label className="field">
        Age group
        <Select
          value={draft.age}
          onValueChange={(value) =>
            setDraft((current) => ({
              ...current,
              age: value as CaseFilters["age"],
            }))
          }
        >
          <SelectTrigger aria-label="Age group">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ageFilters).map(([value, text]) => (
              <SelectItem key={value} value={value}>
                {text}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
    </div>
  );
  const filterFooter = (
    <div className="flex shrink-0 gap-3 border-t border-white/[.06] pt-4">
      <Button
        variant="outline"
        className="h-11"
        onClick={() => setDraft(emptyCaseFilters)}
      >
        Reset
      </Button>
      <Button
        className="h-11 flex-1 border-violet-500 bg-violet-600 text-white hover:bg-violet-500"
        onClick={() => {
          applyFilters(draft);
          setFilterOpen(false);
        }}
      >
        Apply filters
      </Button>
    </div>
  );
  const previewDetails = selected && (
    <CaseDetails
      person={selected}
      onCloseCase={requestClose}
      canManage={canManage}
    />
  );
  function previewButton(person: Person, text?: string) {
    return (
      <Button
        variant="ghost"
        size={text ? "default" : "icon"}
        className={text ? "h-10 text-xs" : "size-9"}
        aria-label={`Preview ${person.name}`}
        onClick={(event) => preview(person, event.currentTarget)}
      >
        <EyeIcon size={17} aria-hidden="true" />
        {text}
      </Button>
    );
  }
  const cards = (compact = false) => (
    <div className={compact ? styles.compactList : styles.cards}>
      {pageRows.map((person) => (
        <article
          className={compact ? styles.compactCard : styles.card}
          key={person.id}
        >
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <PersonAvatar person={person} />
              <div className="min-w-0">
                <Link
                  href={`/cases/${person.id}`}
                  className="block truncate text-sm font-semibold text-zinc-100 hover:text-violet-200"
                >
                  {person.name}
                </Link>
                <p className="mt-1 text-[11px] text-zinc-500">
                  {ageLabel(person)}
                </p>
              </div>
            </div>
            {compact ? previewButton(person) : <Status value={person.status} />}
          </div>
          <p className="mt-4 flex min-w-0 items-center gap-2 text-xs text-zinc-400">
            <Location01Icon size={14} className="shrink-0" aria-hidden="true" />
            <span className="truncate">
              {person.last_seen || "Location not recorded"}
            </span>
          </p>
          {!compact && (
            <p
              className={`${styles.notes} mt-3 text-xs leading-5 text-zinc-500`}
            >
              {person.notes || "No case notes recorded yet."}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[.05] pt-3">
            {compact ? (
              <Status value={person.status} />
            ) : (
              <span className="font-mono text-[10px] text-zinc-600">
                #{person.id.slice(0, 8)}
              </span>
            )}
            <span className="text-[10px] text-zinc-500">
              {dateLabel(person.created_at)}
            </span>
          </div>
          {!compact && (
            <div className="mt-3 flex items-center justify-between gap-2">
              {previewButton(person, "Preview")}
              <Link
                href={`/cases/${person.id}`}
                className="flex items-center gap-1 text-xs font-medium text-violet-300"
              >
                Open record <ArrowRight01Icon size={14} aria-hidden="true" />
              </Link>
            </div>
          )}
        </article>
      ))}
    </div>
  );
  return (
    <div className={styles.registry}>
      <header className={styles.header} data-manage={Boolean(canManage)}>
        <p
          className={`${styles.eyebrow} text-[10px] font-semibold tracking-[.18em] text-violet-300`}
        >
          CASE REGISTRY
        </p>
        <h1
          className={`${styles.heading} leading-tight font-semibold tracking-[-.04em] text-zinc-100`}
        >
          Every case, one clear view.
        </h1>
        {canManage && (
          <Button
            asChild
            className={`${styles.headerAction} h-11 border-violet-500 bg-violet-600 px-4 text-white shadow-[0_4px_18px_#7c3aed20] hover:bg-violet-500`}
          >
            <Link href="/cases/new" aria-label="Register a case">
              <PlusSignIcon size={16} aria-hidden="true" />
              <span className={styles.actionFull}>Register a case</span>
              <span className={styles.actionShort}>New case</span>
            </Link>
          </Button>
        )}
        <p className={`${styles.subtitle} text-sm leading-6 text-zinc-400`}>
          Find a person, follow their progress, and keep your team’s next step
          in sight.
        </p>
      </header>
      <div className={styles.stats}>
        {counts.map((stat) => (
          <button
            key={stat.title}
            className={styles.stat}
            onClick={() =>
              applyFilters({ ...filters, statuses: stat.statuses })
            }
          >
            <span className="flex items-center justify-between gap-2 text-xs text-zinc-400">
              {stat.title}
              <stat.icon size={17} className={stat.color} aria-hidden="true" />
            </span>
            <span className="mt-3 block text-2xl font-semibold tracking-tight tabular-nums text-zinc-100">
              {loading ? (
                <Skeleton className="h-7 w-10" />
              ) : error && !cases.length ? (
                "—"
              ) : (
                stat.count
              )}
            </span>
          </button>
        ))}
      </div>
      <section className={styles.surface} aria-label="Case records">
        <div className="space-y-4 border-b border-white/[.06] p-4 sm:p-5">
          <div className={styles.toolbar}>
            <Input
              className="h-11"
              icon={<Search01Icon size={17} aria-hidden="true" />}
              aria-label="Search cases"
              placeholder="Search name, location, or case ID"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              endIcon={
                search && (
                  <button
                    aria-label="Clear search"
                    className="flex size-6 items-center justify-center rounded text-zinc-500 hover:text-white"
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                  >
                    <Cancel01Icon size={13} aria-hidden="true" />
                  </button>
                )
              }
            />
            <Button
              ref={filterTrigger}
              variant="outline"
              className="h-11"
              onClick={openFilters}
            >
              <FilterHorizontalIcon size={17} aria-hidden="true" />
              Filters
              {filterCount > 0 && (
                <span className="rounded bg-violet-400/15 px-1.5 text-[10px] text-violet-200">
                  {filterCount}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-11"
              aria-label="Refresh cases"
              disabled={refreshing}
              onClick={() => void refresh()}
            >
              <RefreshIcon
                size={17}
                className={
                  refreshing ? "animate-spin motion-reduce:animate-none" : ""
                }
                aria-hidden="true"
              />
            </Button>
            <div
              role="group"
              aria-label="Case view"
              className="flex h-11 items-center rounded-lg border border-zinc-700/60 bg-zinc-950/40 p-1"
            >
              <Button
                variant="ghost"
                size="icon"
                className={`size-9 ${view === "table" ? "bg-violet-400/10 text-violet-200" : "text-zinc-500"}`}
                aria-label="Table view"
                aria-pressed={view === "table"}
                onClick={() => setView("table")}
              >
                <ListViewIcon size={17} aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`size-9 ${view === "grid" ? "bg-violet-400/10 text-violet-200" : "text-zinc-500"}`}
                aria-label="Grid view"
                aria-pressed={view === "grid"}
                onClick={() => setView("grid")}
              >
                <GridViewIcon size={17} aria-hidden="true" />
              </Button>
            </div>
          </div>
          {filterCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.statuses.map((status) => (
                <button
                  key={status}
                  className={styles.chip}
                  aria-label={`Remove ${status} filter`}
                  onClick={() =>
                    applyFilters({
                      ...filters,
                      statuses: filters.statuses.filter((v) => v !== status),
                    })
                  }
                >
                  {label(status)}
                  <Cancel01Icon size={12} aria-hidden="true" />
                </button>
              ))}
              {filters.days > 0 && (
                <button
                  className={styles.chip}
                  onClick={() => applyFilters({ ...filters, days: 0 })}
                >
                  Last {filters.days} days
                  <Cancel01Icon size={12} aria-hidden="true" />
                </button>
              )}
              {filters.age !== "all" && (
                <button
                  className={styles.chip}
                  onClick={() => applyFilters({ ...filters, age: "all" })}
                >
                  {ageFilters[filters.age]}
                  <Cancel01Icon size={12} aria-hidden="true" />
                </button>
              )}
              <button
                className="px-1 text-xs text-zinc-500 hover:text-zinc-200"
                onClick={() => applyFilters(emptyCaseFilters)}
              >
                Clear filters
              </button>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p role="status" className="text-xs text-zinc-500">
              {loading ? (
                "Loading case records…"
              ) : (
                <>
                  <span className="font-medium tabular-nums text-zinc-200">
                    {filtered.length}
                  </span>{" "}
                  {filtered.length === 1 ? "case" : "cases"}
                  {filterCount || search
                    ? " match your search"
                    : " in your registry"}
                </>
              )}
            </p>
            <Select
              value={sort}
              onValueChange={(value) => {
                setSort(value as CaseSort);
                setPage(1);
              }}
            >
              <SelectTrigger
                aria-label="Sort cases"
                className="w-[170px] text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="name">Name, A–Z</SelectItem>
                <SelectItem value="urgent">Urgent first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {error && (
          <div className="border-b border-rose-400/10 p-4">
            <ErrorMessage error={error} />
            <Button
              variant="link"
              size="sm"
              onClick={() => void refresh()}
              disabled={refreshing}
            >
              Try again
            </Button>
          </div>
        )}
        {loading ? (
          <div className="space-y-5 p-5" aria-label="Loading cases">
            {[1, 2, 3, 4].map((key) => (
              <div key={key} className="flex gap-3">
                <Skeleton className="size-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2 w-48 max-w-full" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length ? (
          view === "grid" ? (
            <div className="p-4 sm:p-5">{cards()}</div>
          ) : (
            <>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <caption className="sr-only">
                    Case registry — {filtered.length} matching records
                  </caption>
                  <thead>
                    <tr>
                      <th>Person / case</th>
                      <th>Last seen</th>
                      <th>Status</th>
                      <th>Registered</th>
                      <th>
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((person) => (
                      <tr key={person.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <PersonAvatar person={person} />
                            <div className="min-w-0">
                              <Link
                                className="block max-w-[200px] truncate text-sm font-medium text-zinc-200 hover:text-violet-200"
                                href={`/cases/${person.id}`}
                              >
                                {person.name}
                              </Link>
                              <p className="mt-1 text-[10px] text-zinc-500">
                                {ageLabel(person)} ·{" "}
                                <span className="font-mono">
                                  #{person.id.slice(0, 8)}
                                </span>
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="flex max-w-[170px] items-center gap-2 text-xs text-zinc-400">
                            <Location01Icon
                              size={14}
                              className="shrink-0 text-zinc-600"
                              aria-hidden="true"
                            />
                            <span className="truncate">
                              {person.last_seen || "Not recorded"}
                            </span>
                          </span>
                        </td>
                        <td>
                          <Status value={person.status} />
                        </td>
                        <td className="whitespace-nowrap text-xs text-zinc-500">
                          {dateLabel(person.created_at)}
                        </td>
                        <td>
                          <div className="flex items-center justify-end gap-2">
                            {previewButton(person)}
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="size-9 text-violet-300"
                            >
                              <Link
                                href={`/cases/${person.id}`}
                                aria-label={`Open record for ${person.name}`}
                              >
                                <ArrowRight01Icon
                                  size={16}
                                  aria-hidden="true"
                                />
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {cards(true)}
            </>
          )
        ) : (
          !error && (
            <div className="flex min-h-[290px] flex-col items-center justify-center px-5 py-10 text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-violet-300/15 bg-violet-300/5 text-violet-300">
                <Folder01Icon size={24} aria-hidden="true" />
              </div>
              <h2 className="text-base font-semibold text-zinc-200">
                {cases.length ? "No cases found" : "Your registry starts here"}
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                {cases.length
                  ? "Try a different name, location, or filter to find the case you're looking for."
                  : "Register a person to bring their details, references, and progress into one place."}
              </p>
              {cases.length ? (
                <Button
                  variant="outline"
                  className="mt-5 h-11"
                  onClick={() => {
                    setSearch("");
                    applyFilters(emptyCaseFilters);
                  }}
                >
                  Clear search and filters
                </Button>
              ) : (
                canManage && (
                  <Button asChild variant="outline" className="mt-5 h-11">
                    <Link href="/cases/new">
                      <PlusSignIcon size={16} aria-hidden="true" />
                      Register first case
                    </Link>
                  </Button>
                )
              )}
            </div>
          )
        )}
        {!loading && filtered.length > 0 && (
          <footer className={styles.pagination}>
            <span className="text-xs tabular-nums text-zinc-500">
              {(currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filtered.length)} of{" "}
              {filtered.length} cases
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger
                  aria-label="Cases per page"
                  className="w-[108px] text-xs"
                >
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
                className="size-11"
                aria-label="Previous page"
                disabled={currentPage === 1}
                onClick={() => setPage(currentPage - 1)}
              >
                <ArrowLeft01Icon size={16} aria-hidden="true" />
              </Button>
              <span className="min-w-12 text-center text-xs tabular-nums text-zinc-500">
                {currentPage} / {pageCount}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="size-11"
                aria-label="Next page"
                disabled={currentPage === pageCount}
                onClick={() => setPage(currentPage + 1)}
              >
                <ArrowRight01Icon size={16} aria-hidden="true" />
              </Button>
            </div>
          </footer>
        )}
      </section>
      <p className="flex items-center gap-2 text-[11px] leading-5 text-zinc-600">
        <CheckmarkCircle01Icon
          size={14}
          className="shrink-0"
          aria-hidden="true"
        />
        {cases.length >= 200
          ? "Showing the 200 most recent registered cases."
          : "Case details stay within your approved team workspace."}
      </p>
      {mobile ? (
        <Drawer
          open={filterOpen}
          onOpenChange={setFilterOpen}
          repositionInputs={false}
          autoFocus
        >
          <DrawerContent
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              filterTrigger.current?.focus();
            }}
          >
            <div className="shrink-0 pr-10 pb-4">
              <DrawerClose asChild><Button variant="ghost" size="icon" className="absolute top-7 right-3" aria-label="Close filters"><Cancel01Icon size={18} aria-hidden="true" /></Button></DrawerClose>
              <DrawerTitle className="text-lg font-semibold">
                Filter cases
              </DrawerTitle>
              <DrawerDescription className="mt-1 text-xs text-zinc-500">
                Narrow your registry to the records that matter now.
              </DrawerDescription>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto pb-5">
              {filterFields}
            </div>
            {filterFooter}
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
          <SheetContent
            side="right"
            closeLabel="Close filters"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              filterTrigger.current?.focus();
            }}
          >
            <div className="shrink-0 pr-8 pb-6">
              <SheetTitle className="text-lg font-semibold">
                Filter cases
              </SheetTitle>
              <SheetDescription className="mt-2 text-xs leading-5 text-zinc-500">
                Narrow your registry to the records that matter now.
              </SheetDescription>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto pb-6">
              {filterFields}
            </div>
            {filterFooter}
          </SheetContent>
        </Sheet>
      )}
      {mobile ? (
        <Drawer
          open={previewOpen && Boolean(selected)}
          onOpenChange={setPreviewOpen}
          repositionInputs={false}
        >
          <DrawerContent onCloseAutoFocus={restorePreviewFocus} onOpenAutoFocus={event => { event.preventDefault(); previewHeading.current?.focus(); }}>
            <div className="shrink-0 pb-4">
              <DrawerTitle ref={previewHeading} tabIndex={-1} className="break-words text-xl font-semibold outline-none">
                {selected?.name}
              </DrawerTitle>
              <DrawerDescription className="mt-1 text-xs text-zinc-500">
                Case overview · Saved registry details
              </DrawerDescription>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto pb-4">
              {previewDetails}
            </div>
            <DrawerClose asChild>
              <Button variant="outline" className="h-11 shrink-0">
                Done
              </Button>
            </DrawerClose>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog
          open={previewOpen && Boolean(selected)}
          onOpenChange={setPreviewOpen}
        >
          <DialogContent onCloseAutoFocus={restorePreviewFocus} onOpenAutoFocus={event => { event.preventDefault(); previewHeading.current?.focus(); }}>
            <DialogTitle ref={previewHeading} tabIndex={-1} className="break-words pr-10 text-xl font-semibold outline-none">
              {selected?.name}
            </DialogTitle>
            <DialogDescription className="mt-2 mb-5 text-xs text-zinc-500">
              Case overview · Saved registry details
            </DialogDescription>
            {previewDetails}
          </DialogContent>
        </Dialog>
      )}
      <AlertDialog
        open={Boolean(closing)}
        onOpenChange={(open) => {
          if (!open && !closeBusy) setClosing(null);
        }}
      >
        <AlertDialogContent onCloseAutoFocus={event => { event.preventDefault(); (closeTrigger.current?.isConnected ? closeTrigger.current : previewHeading.current)?.focus(); }}>
          <div className="mb-4 flex size-11 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
            <Archive01Icon size={21} aria-hidden="true" />
          </div>
          <AlertDialogTitle className="text-lg font-semibold">
            Close this case?
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-3 break-words text-sm leading-6 text-zinc-400">
            The case for {closing?.name} will move out of the active list. The
            record and evidence remain available. You can change its status
            again from the full case record.
          </AlertDialogDescription>
          <div className="mt-4">
            <ErrorMessage error={closeError} />
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <AlertDialogCancel disabled={closeBusy} className="h-11">
              Keep active
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={closeBusy}
              className="h-11 border-violet-500 bg-violet-600 text-white hover:bg-violet-500"
              onClick={(event) => {
                event.preventDefault();
                void closeCase();
              }}
            >
              {closeBusy ? "Closing…" : "Close case"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function Cases() {
  const query = useCases();
  const { profile } = useAuth();
  const client = useQueryClient();
  const close = useMutation({
    mutationFn: (person: Person) =>
      api<Person>(`/api/cases/${encodeURIComponent(person.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "closed" }),
      }),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["cases"] }),
        client.invalidateQueries({ queryKey: ["case"] }),
      ]);
    },
  });
  return (
    <CaseRegistry
      cases={query.data}
      loading={query.isPending}
      error={query.error}
      refreshing={query.isFetching}
      canManage={profile?.role === "rescuer" || profile?.role === "admin"}
      onRefresh={async () => {
        const result = await query.refetch();
        if (result.error) throw result.error;
      }}
      onCloseCase={async (person) => {
        await close.mutateAsync(person);
      }}
    />
  );
}
