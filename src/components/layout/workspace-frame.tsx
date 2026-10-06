"use client";
import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  DashboardSquare01Icon,
  Search01Icon,
  Folder01Icon,
  CheckmarkCircle01Icon,
  UserIcon,
  UserGroupIcon,
  Logout01Icon,
  ArrowRight01Icon,
  PlusSignIcon,
  Shield01Icon,
  Calendar03Icon,
  Loading03Icon,
} from "hugeicons-react";
import type { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarTooltip,
  useSidebar,
} from "@/components/ui/sidebar";
import { ErrorMessage } from "@/components/workspace/shared";
import { initials } from "@/lib/dashboard-data";

const primaryNav = [
  { id: "overview", label: "Overview", icon: DashboardSquare01Icon },
  { id: "cases", label: "Case registry", icon: Folder01Icon },
  { id: "search", label: "Face search", icon: Search01Icon },
  { id: "reviews", label: "Review queue", icon: CheckmarkCircle01Icon },
];
const managementNav = [
  { id: "account", label: "My account", icon: UserIcon },
  { id: "team", label: "Team access", icon: UserGroupIcon },
];
export function MemberAvatar({
  profile,
  className = "",
}: {
  profile: Profile;
  className?: string;
}) {
  const colors = {
    violet: "bg-violet-400/10 border-violet-300/20",
    cyan: "bg-cyan-400/10 border-cyan-300/20",
    blue: "bg-blue-400/10 border-blue-300/20",
    amber: "bg-amber-400/10 border-amber-300/20",
    emerald: "bg-emerald-400/10 border-emerald-300/20",
    coral: "bg-orange-400/10 border-orange-300/20",
    rose: "bg-rose-400/10 border-rose-300/20",
    indigo: "bg-indigo-400/10 border-indigo-300/20",
    lime: "bg-lime-400/10 border-lime-300/20",
    silver: "bg-zinc-400/10 border-zinc-300/20",
  };
  return (
    <Avatar
      className={`${colors[profile.avatar_color || "violet"]} ${className}`}
    >
      <AvatarImage
        src={`/assets/avatars/${profile.avatar_key || "scout"}.webp`}
        alt=""
        className="object-contain"
      />
      <AvatarFallback>{initials(profile.display_name)}</AvatarFallback>
    </Avatar>
  );
}
type FrameProps = {
  profile: Profile;
  activeTab: string;
  pendingReviews?: number;
  error?: string;
  onSignOut: () => Promise<void>;
  children: ReactNode;
};

function Frame({
  profile,
  activeTab,
  pendingReviews,
  error,
  onSignOut,
  children,
}: FrameProps) {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();
  const compact = collapsed && !mobileOpen;
  const [signingOut, setSigningOut] = useState(false);
  const management =
    profile.role === "admin" ? managementNav : managementNav.slice(0, 1);
  const active = [...primaryNav, ...management].find(
    (item) => item.id === activeTab,
  );
  const ActiveIcon = active?.icon || Folder01Icon;
  const date = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  async function leave() {
    setSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setSigningOut(false);
    }
  }
  function navItem(item: (typeof primaryNav)[number]) {
    const selected = activeTab === item.id;
    return (
      <SidebarTooltip key={item.id} label={item.label}>
        <Link
          onClick={() => setMobileOpen(false)}
          href={`/dashboard?tab=${item.id}`}
          aria-label={compact ? item.label : undefined}
          aria-current={selected ? "page" : undefined}
          className={`workspace-nav-item ${selected ? "is-active" : ""}`}
        >
          <item.icon
            size={19}
            strokeWidth={1.6}
            className="shrink-0"
            aria-hidden="true"
          />
          <span className="sidebar-label flex-1 truncate">{item.label}</span>
          {item.id === "reviews" &&
            pendingReviews !== undefined &&
            pendingReviews > 0 && (
              <span className="sidebar-label rounded-md bg-violet-300/10 px-1.5 py-0.5 text-[10px] text-violet-200">
                {pendingReviews}
              </span>
            )}
          {selected && (
            <ArrowRight01Icon
              size={13}
              className="sidebar-label text-violet-300"
              aria-hidden="true"
            />
          )}
        </Link>
      </SidebarTooltip>
    );
  }
  return (
    <>
      <Sidebar>
        <div className="workspace-sidebar-inner" data-compact={compact}>
          <div className="sidebar-brand flex h-[72px] shrink-0 items-center px-2">
            <Link
              href="/"
              aria-label="ResQ home"
              className="flex items-center gap-2.5"
            >
              <Image
                src="/assets/resq-mark.svg"
                width={32}
                height={32}
                alt=""
                className="shrink-0"
              />
              <span className="sidebar-label text-[26px] font-semibold tracking-[-.06em] text-zinc-50">
                ResQ<span className="text-violet-300">.</span>
              </span>
            </Link>
          </div>
          <div className="sidebar-workspace-stamp">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-violet-300/20 bg-violet-300/10 text-violet-300">
              <Shield01Icon size={18} aria-hidden="true" />
            </div>
            <div className="sidebar-label min-w-0">
              <p className="text-xs font-medium text-zinc-200">
                Search workspace
              </p>
              <p className="mt-0.5 text-[10px] text-zinc-500">
                Cases · Evidence · People
              </p>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto py-6">
            <p className="sidebar-group-label">WORKSPACE</p>
            <nav aria-label="Workspace" className="space-y-1">
              {primaryNav.map(navItem)}
            </nav>
            <p className="sidebar-group-label mt-7">MANAGE</p>
            <nav aria-label="Account and team" className="space-y-1">
              {management.map(navItem)}
            </nav>
          </div>
          <div className="shrink-0 space-y-3 pb-3">
            {profile.role !== "verifier" && (
              <SidebarTooltip label="Register a case">
                <Button
                  asChild
                  variant="outline"
                  className="sidebar-new-case h-11 w-full border-violet-300/20 bg-violet-300/5 text-violet-200 hover:bg-violet-300/10"
                >
                  <Link
                    href="/cases/new"
                    aria-label={compact ? "Register a case" : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <PlusSignIcon
                      size={18}
                      className="shrink-0"
                      aria-hidden="true"
                    />
                    <span className="sidebar-label">Register a case</span>
                  </Link>
                </Button>
              </SidebarTooltip>
            )}
            <div className="sidebar-label rounded-xl border border-white/[.05] bg-white/[.02] p-3.5">
              <p className="flex items-center gap-2 text-[11px] font-medium text-zinc-300">
                <Shield01Icon
                  size={15}
                  className="text-violet-300"
                  aria-hidden="true"
                />
                People make the final call.
              </p>
              <p className="mt-2 text-[10px] leading-5 text-zinc-500">
                Every potential match needs an independent review.
              </p>
            </div>
            <SidebarTooltip label={`${profile.display_name} · ${profile.role}`}>
              <Link
                href="/dashboard?tab=account"
                onClick={() => setMobileOpen(false)}
                aria-label={compact ? "My account" : undefined}
                className="sidebar-identity"
              >
                <MemberAvatar profile={profile} className="size-9 rounded-xl" />
                <div className="sidebar-label min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-zinc-100">
                    {profile.display_name}
                  </p>
                  <Badge className="mt-1 border-0 bg-violet-300/10 px-1.5 py-0 text-[9px] font-medium capitalize">
                    {profile.role}
                  </Badge>
                </div>
                <ArrowRight01Icon
                  size={14}
                  className="sidebar-label text-zinc-500"
                  aria-hidden="true"
                />
              </Link>
            </SidebarTooltip>
          </div>
        </div>
      </Sidebar>
      <div className="workspace-content-pane">
        <header className="workspace-toolbar">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <SidebarTrigger />
            <div className="hidden h-5 w-px bg-zinc-800 sm:block" />
            <span className="hidden text-xs text-zinc-500 lg:inline">
              Workspace
            </span>
            <span className="hidden text-zinc-700 lg:inline">/</span>
            <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-zinc-200">
              <ActiveIcon
                size={16}
                className="shrink-0 text-violet-300"
                aria-hidden="true"
              />
              <span className="truncate">{active?.label || "Cases"}</span>
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <span className="hidden items-center gap-2 text-[11px] text-zinc-500 xl:flex">
              <Calendar03Icon size={15} aria-hidden="true" />
              {date}
            </span>
            <Link href="/dashboard?tab=account" aria-label="My account">
              <MemberAvatar profile={profile} className="size-8" />
            </Link>
            <Button
              variant="outline"
              disabled={signingOut}
              onClick={() => void leave()}
              className="h-10 px-2.5 text-xs! sm:px-3"
              aria-label="Sign out"
            >
              {signingOut ? (
                <Loading03Icon
                  size={16}
                  className="animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : (
                <Logout01Icon size={16} aria-hidden="true" />
              )}
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </header>
        <main className="workspace-content-body">
          <ErrorMessage error={error} />
          {children}
        </main>
        <footer className="workspace-content-footer">
          <span>ResQ · Search & reconnect</span>
          <span>Independent review. Informed decisions.</span>
        </footer>
      </div>
    </>
  );
}
export function WorkspaceFrame(props: FrameProps) {
  return (
    <SidebarProvider>
      <Frame {...props} />
    </SidebarProvider>
  );
}
