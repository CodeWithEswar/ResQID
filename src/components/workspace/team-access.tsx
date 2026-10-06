"use client";

import { useRef, useState, type CSSProperties } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft01Icon, ArrowRight01Icon, Calendar03Icon, Cancel01Icon, CheckmarkCircle01Icon, Clock01Icon, FilterHorizontalIcon, GridViewIcon, ListViewIcon, RefreshIcon, Search01Icon, Shield01Icon, UserGroupIcon } from "hugeicons-react";
import { useAuth } from "@/components/providers/auth-provider";
import { MemberAvatar } from "@/components/layout/workspace-frame";
import { useTeam } from "@/hooks/use-workspace";
import { useIsMobile } from "@/hooks/use-mobile";
import { api } from "@/lib/api";
import type { Profile, Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { AlertDialog, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { EmptyState, ErrorMessage, dateLabel } from "./shared";
import styles from "./team-access.module.css";

const roles: Record<Role, { label: string; variant: BadgeProps["variant"]; color: string; description: string }> = {
  pending: { label: "Pending", variant: "warning", color: "#edbd69", description: "Awaiting approval. Workspace tools are unavailable until a role is assigned." },
  rescuer: { label: "Rescuer", variant: "cyan", color: "#67d5e7", description: "Can register cases, enroll references, and search for possible leads." },
  verifier: { label: "Verifier", variant: "success", color: "#70cda8", description: "Can search references and independently review possible leads." },
  admin: { label: "Administrator", variant: "default", color: "#b9a2f6", description: "Manages workspace access, cases, and independent reviews." },
};
type Filters = { role: "all" | Role; from: string; to: string };
const defaultFilters: Filters = { role: "all", from: "", to: "" };
const pageSize = 12;
function RoleBadge({ role }: { role: Role }) {
  return <Badge variant={roles[role].variant} dot className={styles.roleBadge}>{roles[role].label}</Badge>;
}
function FilterFields({ value, onChange }: { value: Filters; onChange: (value: Filters) => void }) {
  return <div className={styles.filterFields}>
    <label><span>Workspace role</span><Select value={value.role} onValueChange={role => onChange({ ...value, role: role as Filters["role"] })}>
      <SelectTrigger aria-label="Filter by workspace role"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="all">All roles</SelectItem>{Object.entries(roles).map(([key, role]) => <SelectItem key={key} value={key}>{role.label}</SelectItem>)}</SelectContent>
    </Select></label>
    <fieldset><legend>Joined date</legend><p>Show members who joined within this range.</p>
      <label><span>From</span><Input type="date" value={value.from} max={value.to || undefined} onInput={event => onChange({ ...value, from: event.currentTarget.value })} onChange={event => onChange({ ...value, from: event.target.value })} /></label>
      <label><span>To</span><Input type="date" value={value.to} min={value.from || undefined} onInput={event => onChange({ ...value, to: event.currentTarget.value })} onChange={event => onChange({ ...value, to: event.target.value })} /></label>
    </fieldset>
    <div className={styles.filterNote}><Shield01Icon size={20} aria-hidden="true" /><p>Filters change this view. Member permissions stay the same.</p></div>
  </div>;
}

export function TeamAccessView({ members, viewerId, loading = false, refreshing = false, error, onRefresh, onAssign }: {
  members: Profile[]; viewerId: string; loading?: boolean; refreshing?: boolean;
  error?: Error | string | null; onRefresh: () => Promise<unknown>;
  onAssign: (id: string, role: Role) => Promise<unknown>;
}) {
  const mobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [draft, setDraft] = useState<Filters>(defaultFilters);
  const [filterPanel, setFilterPanel] = useState<"sheet" | "drawer" | null>(null);
  const [view, setView] = useState<"grid" | "rows">("rows");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [change, setChange] = useState<{ member: Profile; role: Role } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const filterTrigger = useRef<HTMLButtonElement>(null);
  const roleTrigger = useRef<HTMLButtonElement | null>(null);
  const saveFeedback = useRef<HTMLDivElement>(null);
  const counts = members.reduce((result, member) => { result[member.role]++; return result; }, { pending: 0, rescuer: 0, verifier: 0, admin: 0 });
  const term = search.trim().toLocaleLowerCase();
  const filtered = members.filter(member => {
    if (filters.role !== "all" && member.role !== filters.role) return false;
    if (term && !`${member.display_name} ${member.email || ""} ${member.id}`.toLocaleLowerCase().includes(term)) return false;
    const joined = member.created_at ? new Date(member.created_at) : null;
    const joinedDay = joined && !Number.isNaN(joined.getTime()) ? joined.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) : "";
    return (!filters.from || !!joinedDay && joinedDay >= filters.from) && (!filters.to || !!joinedDay && joinedDay <= filters.to);
  }).sort((a, b) => sort === "name" ? a.display_name.localeCompare(b.display_name) :
    ((Date.parse(b.created_at || "") || 0) - (Date.parse(a.created_at || "") || 0)) * (sort === "oldest" ? -1 : 1));
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const filterCount = Number(filters.role !== "all") + Number(!!filters.from || !!filters.to);
  const invalidDates = !!draft.from && !!draft.to && draft.from > draft.to;
  function updateFilters(value: Filters) { setFilters(value); setPage(1); }
  function reset() { setSearch(""); updateFilters(defaultFilters); }
  async function refresh() {
    try { await onRefresh(); toast.success("Team refreshed"); }
    catch (cause) { toast.error(cause instanceof Error ? cause.message : "Could not refresh the team"); }
  }
  async function confirmChange() {
    if (!change || saving || change.member.id === viewerId || change.member.role === "admin") return;
    setSaving(true); setSaveError(null);
    try {
      await onAssign(change.member.id, change.role);
      toast.success(change.role === "pending" ? "Workspace access set to pending" : "Team access updated", { description: `${change.member.display_name} · ${roles[change.role].label}` });
      setChange(null);
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : "Could not update access. Please try again.");
      requestAnimationFrame(() => saveFeedback.current?.focus());
    } finally { setSaving(false); }
  }
  const filterBody = <>
    <FilterFields value={draft} onChange={setDraft} />
    {invalidDates && <ErrorMessage error="The end date must be on or after the start date." />}
    <div className={styles.filterActions}><Button variant="outline" onClick={() => setDraft(defaultFilters)}>Reset</Button><Button disabled={invalidDates} onClick={() => { updateFilters(draft); setFilterPanel(null); }}>Apply filters</Button></div>
  </>;
  return <div className={styles.team}>
    <header className={styles.heading}>
      <div><p className={styles.eyebrow}>TEAM ACCESS</p><h1>Good work starts<br className={styles.titleBreak} /> with the right people.</h1></div>
      <Button variant="outline" className={styles.refresh} aria-label="Refresh team" disabled={refreshing || loading} onClick={() => void refresh()}>
        <RefreshIcon size={17} className={refreshing ? styles.spinning : ""} aria-hidden="true" /><span>Refresh<span className={styles.desktopOnly}> team</span></span>
      </Button>
      <p className={styles.subtitle}>A clear view of your team. Approve access and give every member the right role.</p>
    </header>
    <section className={styles.stats} aria-label="Team summary">
      {[
        { label: "Team members", value: members.length, role: "all" as const, color: "#b9a2f6", Icon: UserGroupIcon, detail: "In this directory" },
        { label: "Awaiting approval", value: counts.pending, role: "pending" as const, color: roles.pending.color, Icon: Clock01Icon, detail: "Ready for your review" },
        { label: "Rescuers", value: counts.rescuer, role: "rescuer" as const, color: roles.rescuer.color, Icon: Search01Icon, detail: "Following the next clue" },
        { label: "Verifiers", value: counts.verifier, role: "verifier" as const, color: roles.verifier.color, Icon: CheckmarkCircle01Icon, detail: "Reviewing possible leads" },
      ].map(({ label, value, role, color, Icon, detail }) => <button key={role} className={styles.stat} data-active={filters.role === role} style={{ "--team-accent": color } as CSSProperties} onClick={() => updateFilters({ ...filters, role })} aria-pressed={filters.role === role}>
        <span className={styles.statLabel}>{label}<Icon size={19} aria-hidden="true" /></span>
        <strong>{loading ? "—" : value}</strong><span className={styles.statDetail}>{detail}</span>
      </button>)}
    </section>
    <section className={styles.directory} aria-label="Team directory">
      <div className={styles.directoryHeading}><div><h2>Member directory</h2><p>People, roles, and a shared purpose.</p></div><Badge variant="outline" className={styles.directoryCount}>{loading ? "Loading" : `${members.length} members`}</Badge></div>
      <div className={styles.toolbar}>
        <div className={styles.search}><Search01Icon size={18} aria-hidden="true" /><Input aria-label="Search team members" placeholder="Search name or email…" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} />{search && <button aria-label="Clear search" onClick={() => { setSearch(""); setPage(1); }}><Cancel01Icon size={16} /></button>}</div>
        <Button ref={filterTrigger} variant="outline" className={styles.filterButton} onClick={() => { setDraft(filters); setFilterPanel(mobile ? "drawer" : "sheet"); }}><FilterHorizontalIcon size={18} aria-hidden="true" />Filters{filterCount > 0 && <span className={styles.filterNumber}>{filterCount}</span>}</Button>
        <Select value={sort} onValueChange={value => { setSort(value); setPage(1); }}><SelectTrigger aria-label="Sort team members" className={styles.sort}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="newest">Newest first</SelectItem><SelectItem value="oldest">Oldest first</SelectItem><SelectItem value="name">Name A–Z</SelectItem></SelectContent></Select>
        <div className={styles.viewToggle} role="group" aria-label="Directory view"><Button variant="ghost" size="icon" aria-label="Row view" aria-pressed={view === "rows"} data-active={view === "rows"} onClick={() => setView("rows")}><ListViewIcon size={18} /></Button><Button variant="ghost" size="icon" aria-label="Grid view" aria-pressed={view === "grid"} data-active={view === "grid"} onClick={() => setView("grid")}><GridViewIcon size={18} /></Button></div>
      </div>
      <div className={styles.roleTabs} role="group" aria-label="Quick role filters">{(["all", "pending", "rescuer", "verifier", "admin"] as const).map(role => <button key={role} aria-pressed={filters.role === role} data-active={filters.role === role} onClick={() => updateFilters({ ...filters, role })}>{role === "all" ? "Everyone" : role === "admin" ? "Admins" : roles[role].label}<span>{role === "all" ? members.length : counts[role]}</span></button>)}</div>
      {(filters.from || filters.to) && <div className={styles.activeFilters}><span>Joined {filters.from ? `from ${dateLabel(filters.from + "T00:00:00+05:30")}` : "any time"}{filters.to ? ` to ${dateLabel(filters.to + "T00:00:00+05:30")}` : " onward"}</span><button aria-label="Remove joined date filter" onClick={() => updateFilters({ ...filters, from: "", to: "" })}><Cancel01Icon size={14} /></button></div>}
      <div className={styles.error}><ErrorMessage error={error} /></div>
      {loading ? <div className={styles.memberGrid} role="status" aria-label="Loading team members">{[0, 1, 2].map(item => <div className={styles.skeleton} key={item}><Skeleton className="size-12 rounded-xl" /><Skeleton className="mt-5 h-5 w-2/3" /><Skeleton className="mt-3 h-4 w-full" /><Skeleton className="mt-8 h-11 w-full" /></div>)}</div> : visible.length ? <>
        {view === "rows" && <div className={styles.rowHead} aria-hidden="true"><span>Team member</span><span>Workspace role</span><span>Joined</span><span>Manage access</span></div>}
        <div className={view === "grid" ? styles.memberGrid : styles.memberRows}>
          {visible.map(member => {
            const protectedMember = member.id === viewerId || member.role === "admin";
            return <article key={member.id} className={styles.member} data-view={view} data-pending={member.role === "pending"}>
              <div className={styles.identity}><div className={styles.avatarFrame}><MemberAvatar profile={member} className={styles.avatar} /></div><div className={styles.identityText}><h3>{member.display_name || "Team member"}{member.id === viewerId && <span className={styles.you}>You</span>}</h3><p title={member.email || member.id}>{member.email || `Member · ${member.id.slice(0, 8)}`}</p></div></div>
              <div className={styles.memberRole}><RoleBadge role={member.role} />{view === "grid" && <p>{roles[member.role].description}</p>}</div>
              <div className={styles.joined}><Calendar03Icon size={15} aria-hidden="true" /><span><span className={styles.joinedLabel}>Joined </span>{member.created_at ? dateLabel(member.created_at) : "Date unavailable"}</span></div>
              <div className={styles.memberAction}>{protectedMember ? <span className={styles.protected}><Shield01Icon size={16} aria-hidden="true" />Protected account</span> : <Select value={member.role} disabled={saving} onValueChange={value => { if (value !== member.role) { setSaveError(null); setChange({ member, role: value as Role }); } }}><SelectTrigger onFocus={event => { roleTrigger.current = event.currentTarget; }} aria-label={`Change role for ${member.display_name}`} className={styles.memberSelect}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="rescuer">Rescuer</SelectItem><SelectItem value="verifier">Verifier</SelectItem></SelectContent></Select>}
              </div>
            </article>;
          })}
        </div>
        <div className={styles.pagination}><p role="status">Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} members</p><div><Button variant="outline" size="icon" aria-label="Previous page" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ArrowLeft01Icon size={17} /></Button><span>{currentPage} / {pageCount}</span><Button variant="outline" size="icon" aria-label="Next page" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}><ArrowRight01Icon size={17} /></Button></div></div>
      </> : <div className={styles.empty}><EmptyState title={members.length ? "No members match this view." : error ? "The directory is unavailable." : "Your team directory is empty."} description={members.length ? "Try another name or adjust the filters to find your teammate." : error ? "Refresh to try loading your workspace members again." : "New members will appear here after they sign in."} artwork="access/approval" action={<Button variant="outline" disabled={refreshing} onClick={members.length ? reset : () => void refresh()}>{members.length ? "Clear search & filters" : "Refresh directory"}</Button>} /></div>}
    </section>
    <aside className={styles.accessNote}><Shield01Icon size={21} aria-hidden="true" /><div><strong>The right access. An independent review.</strong><p>Rescuers build case records. Verifiers review possible leads. Administrator access is protected.</p></div></aside>
    <Sheet open={filterPanel === "sheet"} onOpenChange={open => { if (!open) setFilterPanel(null); }}><SheetContent onCloseAutoFocus={event => { event.preventDefault(); filterTrigger.current?.focus(); }} side="right" closeLabel="Close team filters" className={styles.filterPanel}><SheetTitle className={styles.panelTitle}>Refine your team view</SheetTitle><SheetDescription className={styles.panelDescription}>Find the people you need, with fewer distractions.</SheetDescription>{filterBody}</SheetContent></Sheet>
    <Drawer autoFocus open={filterPanel === "drawer"} onOpenChange={open => { if (!open) setFilterPanel(null); }}><DrawerContent onCloseAutoFocus={event => { event.preventDefault(); filterTrigger.current?.focus(); }} className={styles.filterDrawer}><div className={styles.drawerHeader}><DrawerTitle className={styles.panelTitle}>Team filters</DrawerTitle><DrawerClose asChild><Button variant="ghost" size="icon" aria-label="Close team filters"><Cancel01Icon size={18} /></Button></DrawerClose></div><DrawerDescription className={styles.panelDescription}>Choose a role or a joined date range.</DrawerDescription>{filterBody}</DrawerContent></Drawer>
    <AlertDialog open={!!change} onOpenChange={open => { if (!open && !saving) { setChange(null); setSaveError(null); } }}><AlertDialogContent onCloseAutoFocus={event => { event.preventDefault(); (roleTrigger.current?.isConnected ? roleTrigger.current : filterTrigger.current)?.focus(); }} className={styles.confirmDialog}>
      {change && <><div className={styles.confirmIcon}><Shield01Icon size={24} aria-hidden="true" /></div><AlertDialogTitle className={styles.panelTitle}>{change.role === "pending" ? "Set access to pending?" : change.member.role === "pending" ? "Approve workspace access?" : "Change workspace role?"}</AlertDialogTitle><AlertDialogDescription className={styles.panelDescription}>Review the new role for {change.member.display_name} before you save.</AlertDialogDescription>
        <div className={styles.confirmMember}><MemberAvatar profile={change.member} className="size-11" /><div><strong>{change.member.display_name}</strong><p>{change.member.email || change.member.id.slice(0, 8)}</p></div></div>
        <div className={styles.roleChange}><RoleBadge role={change.member.role} /><ArrowRight01Icon size={18} aria-label="changes to" /><RoleBadge role={change.role} /></div><p className={styles.permissionCopy}>{roles[change.role].description}</p><div ref={saveFeedback} tabIndex={-1} className={styles.saveFeedback}><ErrorMessage error={saveError} /></div>
        <div className={styles.confirmActions}><AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel><AlertDialogAction disabled={saving} onClick={event => { event.preventDefault(); void confirmChange(); }}>{saving ? "Saving…" : change.member.role === "pending" && change.role !== "pending" ? "Approve access" : "Save role"}</AlertDialogAction></div>
      </>}
    </AlertDialogContent></AlertDialog>
  </div>;
}

export function Team() {
  const { profile } = useAuth();
  const query = useTeam();
  const client = useQueryClient();
  const assign = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => api(`/api/team/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ role }) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["team"] }),
  });
  if (profile?.role !== "admin") return <EmptyState title="Team access is managed by an administrator." description="Contact your administrator to change workspace permissions." artwork="access/approval" />;
  return <TeamAccessView members={query.data || []} viewerId={profile.id} loading={query.isPending} refreshing={query.isFetching} error={query.error}
    onRefresh={async () => { const result = await query.refetch(); if (result.error) throw result.error; }}
    onAssign={async (id, role) => {
      const member = query.data?.find(item => item.id === id);
      if (!member || id === profile.id || member.role === "admin" || role === "admin") throw new Error("Administrator accounts are protected.");
      return assign.mutateAsync({ id, role });
    }} />;
}
