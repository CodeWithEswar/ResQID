"use client";

import { useRef, useState, type CSSProperties, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowRight01Icon, Calendar03Icon, Cancel01Icon, CheckmarkCircle01Icon,
  Copy01Icon, Edit02Icon, Folder01Icon, Image01Icon, Mail01Icon,
  Search01Icon, Shield01Icon, UserGroupIcon, UserIcon,
} from "hugeicons-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useIsMobile } from "@/hooks/use-mobile";
import { api } from "@/lib/api";
import type { AvatarColor, AvatarKey, Profile } from "@/lib/types";
import { initials } from "@/lib/dashboard-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { Artwork, ErrorMessage, Loading, dateLabel } from "./shared";
import styles from "./account-profile.module.css";

export type ProfileChanges = {
  display_name: string;
  avatar_key: AvatarKey;
  avatar_color: AvatarColor;
};

const avatars: { key: AvatarKey; label: string }[] = [
  { key: "scout", label: "Scout" }, { key: "tech", label: "Tech" },
  { key: "pilot", label: "Pilot" }, { key: "medic", label: "Medic" },
  { key: "ranger", label: "Ranger" }, { key: "lead", label: "Lead" },
  { key: "cadet", label: "Cadet" }, { key: "analyst", label: "Analyst" },
  { key: "diver", label: "Diver" }, { key: "spark", label: "Spark" },
  { key: "short-hair", label: "Short hair" },
  { key: "curly-hair", label: "Curly hair" },
  { key: "tied-hair", label: "Tied hair" },
];
const accents: Record<AvatarColor, string> = {
  violet: "#a78bfa", cyan: "#67d5e7", blue: "#7aaff8", amber: "#edbd69",
  emerald: "#70cda8", coral: "#ef9b79", rose: "#e794b0", indigo: "#a0a2f1",
  lime: "#bedb78", silver: "#aeb6c8",
};
const roleCopy = {
  admin: {
    title: "Administrator", description: "Keep your team connected and the work moving.",
    permissions: ["Manage team access and roles", "Register cases and enroll references", "Search and independently review leads"],
  },
  rescuer: {
    title: "Rescuer", description: "Turn the next detail into a useful starting point.",
    permissions: ["Register and update cases", "Enroll authorized reference evidence", "Search your workspace for possible leads"],
  },
  verifier: {
    title: "Verifier", description: "Give every possible lead an independent look.",
    permissions: ["Search enrolled face references", "Compare evidence alongside the case", "Record independent review decisions"],
  },
  pending: {
    title: "Awaiting approval", description: "Your administrator will assign your workspace role.",
    permissions: ["An administrator approves workspace access", "Your role determines the tools available to you"],
  },
};

function ProfilePortrait({ name, avatar, color, large = false }: {
  name: string; avatar: AvatarKey; color: AvatarColor; large?: boolean;
}) {
  return (
    <div className={`${styles.portraitFrame} ${large ? styles.largePortrait : ""}`}
      style={{ "--profile-accent": accents[color] } as CSSProperties}>
      <Avatar className={styles.portrait}>
        <AvatarImage src={`/assets/avatars/${avatar}.webp`} alt={`${name || "Your profile"} avatar`} />
        <AvatarFallback>{initials(name || "You")}</AvatarFallback>
      </Avatar>
    </div>
  );
}

function ProfileEditor({ profile, onSave, onCancel, onBusyChange }: {
  profile: Profile;
  onSave: (changes: ProfileChanges) => Promise<void>;
  onCancel: () => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [name, setName] = useState(profile.display_name);
  const [avatar, setAvatar] = useState<AvatarKey>(profile.avatar_key || "scout");
  const [color, setColor] = useState<AvatarColor>(profile.avatar_color || "violet");
  const [choosingAvatar, setChoosingAvatar] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirty = name.trim() !== profile.display_name.trim()
    || avatar !== (profile.avatar_key || "scout")
    || color !== (profile.avatar_color || "violet");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !dirty || busy) return;
    setBusy(true);
    onBusyChange(true);
    setError(null);
    try {
      await onSave({ display_name: name.trim(), avatar_key: avatar, avatar_color: color });
      toast.success("Your profile has been updated.");
      onBusyChange(false);
      onCancel();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Your profile couldn’t be saved. Please try again.");
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  }

  return (
    <form className={styles.editorForm} onSubmit={(event) => void submit(event)}>
      <div className={styles.editorBody}>
        <div className={styles.previewCard} aria-label="Profile preview">
          <ProfilePortrait name={name} avatar={avatar} color={color} />
          <div><span className={styles.kicker}>YOUR PROFILE PREVIEW</span><strong>{name.trim() || "Your name"}</strong><p>{roleCopy[profile.role].title}</p></div>
        </div>
        <div className={styles.nameField}>
          <label htmlFor="profile-display-name">Display name</label>
          <Input id="profile-display-name" name="display_name" required maxLength={120}
            autoComplete="nickname" value={name} disabled={busy}
            onChange={(event) => { setName(event.target.value); setError(null); }}
            aria-describedby="profile-name-help" />
          <p id="profile-name-help">The name your teammates see across the workspace.</p>
        </div>
        <div className={styles.avatarSection}>
          <div className={styles.avatarSectionHeading}>
            <div><h3>Profile avatar</h3><p>{avatars.find((item) => item.key === avatar)?.label} · {color[0].toUpperCase() + color.slice(1)} accent</p></div>
            <Button type="button" variant="outline" disabled={busy}
              aria-expanded={choosingAvatar} aria-controls="profile-avatar-options"
              onClick={() => setChoosingAvatar((value) => !value)}>
              <Image01Icon size={15} aria-hidden="true" />{choosingAvatar ? "Hide options" : "Change avatar"}
            </Button>
          </div>
          {choosingAvatar && <div id="profile-avatar-options" className={styles.avatarOptions}>
            <div className={styles.avatarGrid} role="group" aria-label="Choose profile avatar">
              {avatars.map((item) => <button key={item.key} type="button"
                disabled={busy} aria-label={`Use ${item.label} avatar`} aria-pressed={avatar === item.key}
                onClick={() => { setAvatar(item.key); setError(null); }}>
                <Image src={`/assets/avatars/${item.key}.webp`} alt="" width={58} height={58} />
                <span>{item.label}</span>
                {avatar === item.key && <CheckmarkCircle01Icon className={styles.selectedMark} size={14} aria-hidden="true" />}
              </button>)}
            </div>
            <fieldset className={styles.accentField}>
              <legend>Accent color <span>{color[0].toUpperCase() + color.slice(1)}</span></legend>
              <div className={styles.colorChoices}>
                {(Object.keys(accents) as AvatarColor[]).map((accent) => <button key={accent}
                  type="button" disabled={busy} aria-label={`Use ${accent} accent`} aria-pressed={color === accent}
                  style={{ "--accent-swatch": accents[accent] } as CSSProperties}
                  onClick={() => { setColor(accent); setError(null); }}>
                  <span>{color === accent && <CheckmarkCircle01Icon size={15} aria-hidden="true" />}</span>
                </button>)}
              </div>
            </fieldset>
          </div>}
        </div>
        <ErrorMessage error={error} />
      </div>
      <div className={styles.editorFooter}>
        <span aria-live="polite">{busy ? "Saving your profile…" : dirty ? "Changes ready to save" : "Your profile is up to date"}</span>
        <Button type="button" variant="ghost" disabled={busy} onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={busy || !name.trim() || !dirty}>{busy ? "Saving…" : "Save changes"}</Button>
      </div>
    </form>
  );
}

export function AccountProfileView({ profile, email, onSave }: {
  profile: Profile; email?: string; onSave: (changes: ProfileChanges) => Promise<void>;
}) {
  const mobile = useIsMobile();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMobile, setEditorMobile] = useState(false);
  const [editorVersion, setEditorVersion] = useState(0);
  const [saving, setSaving] = useState(false);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const role = roleCopy[profile.role];
  const accountEmail = email || profile.email;
  function edit(trigger: HTMLButtonElement) {
    returnFocus.current = trigger;
    setEditorMobile(mobile);
    setEditorVersion((version) => version + 1);
    setEditorOpen(true);
  }
  function changeOpen(open: boolean) { if (!saving) setEditorOpen(open); }
  async function copyId() {
    try { await navigator.clipboard.writeText(profile.id); toast.success("Account ID copied."); }
    catch { toast.error("Couldn’t copy the ID. You can select it below."); }
  }
  const editor = <ProfileEditor key={editorVersion} profile={profile} onSave={onSave}
    onCancel={() => setEditorOpen(false)} onBusyChange={setSaving} />;
  return (
    <div className={styles.page}>
      <header className={styles.pageHeading}>
        <div><p className={styles.kicker}>YOUR WORKSPACE IDENTITY</p><h1>My account<span>.</span></h1><p>A familiar face. A clear place on the team.</p></div>
        <Button onClick={(event) => edit(event.currentTarget)}><Edit02Icon size={16} aria-hidden="true" />Edit profile</Button>
      </header>
      <section className={styles.profileHero} aria-label="Your profile">
        <div className={styles.heroIdentity}>
          <ProfilePortrait name={profile.display_name} avatar={profile.avatar_key || "scout"} color={profile.avatar_color || "violet"} large />
          <div className={styles.heroCopy}><span className={styles.kicker}>RESQ WORKSPACE MEMBER</span><h2>{profile.display_name}</h2><p><Mail01Icon size={14} aria-hidden="true" />{accountEmail || "Email not available"}</p><Badge variant={profile.role === "pending" ? "warning" : "default"} className="mt-3 text-[10px] font-medium"><Shield01Icon size={12} aria-hidden="true" />{role.title}</Badge></div>
        </div>
        <div className={styles.heroSignature}><span>ONE TEAM. ONE PURPOSE.</span><p>Every connection<br />moves the search forward.</p><div><i aria-hidden="true" />Search & reconnect</div></div>
      </section>
      <div className={styles.layout}>
        <section className={styles.detailsPanel} aria-labelledby="account-details-heading">
          <div className={styles.sectionHeading}><div><span className={styles.kicker}>THE PERSONAL DETAILS</span><h2 id="account-details-heading">Profile & account</h2></div><UserIcon size={20} aria-hidden="true" /></div>
          <dl className={styles.details}>
            <div><dt><UserIcon size={15} aria-hidden="true" />Display name</dt><dd>{profile.display_name}</dd><Button variant="ghost" size="icon" aria-label="Edit display name" onClick={(event) => edit(event.currentTarget)}><Edit02Icon size={15} /></Button></div>
            <div><dt><Mail01Icon size={15} aria-hidden="true" />Sign-in email</dt><dd>{accountEmail || "Not available"}<small>Your sign-in account</small></dd></div>
            <div><dt><Shield01Icon size={15} aria-hidden="true" />Workspace role</dt><dd>{role.title}<small>Assigned by your workspace administrator</small></dd></div>
            {profile.created_at && <div><dt><Calendar03Icon size={15} aria-hidden="true" />Member since</dt><dd>{dateLabel(profile.created_at)}</dd></div>}
          </dl>
          <div className={styles.accountId}><div><span>ACCOUNT ID</span><p>{profile.id}</p></div><Button variant="ghost" size="icon" aria-label="Copy account ID" onClick={() => void copyId()}><Copy01Icon size={15} /></Button></div>
        </section>
        <section className={styles.accessPanel} aria-labelledby="account-access-heading">
          <div className={styles.sectionHeading}><div><span className={styles.kicker}>YOUR PLACE ON THE TEAM</span><h2 id="account-access-heading">Workspace access</h2></div><Shield01Icon size={20} aria-hidden="true" /></div>
          <div className={styles.roleIntro}><Artwork name="access/workspace" /><div><Badge variant={profile.role === "pending" ? "warning" : "default"} className="text-[10px] font-medium">{role.title}</Badge><h3>{role.description}</h3></div></div>
          <ul className={styles.permissions}>{role.permissions.map((permission) => <li key={permission}><CheckmarkCircle01Icon size={16} aria-hidden="true" /><span>{permission}</span></li>)}</ul>
          <div className={styles.accessFooter}>{profile.role === "admin" ? <Button variant="outline" asChild><Link href="/dashboard?tab=team"><UserGroupIcon size={16} aria-hidden="true" />Manage team access<ArrowRight01Icon size={15} aria-hidden="true" /></Link></Button> : <p><Shield01Icon size={15} aria-hidden="true" />Contact your administrator if your role needs to change.</p>}</div>
        </section>
      </div>
      {profile.role !== "pending" && <section className={styles.shortcuts} aria-label="Workspace shortcuts">
        <Link href="/dashboard?tab=cases"><span className={styles.shortcutIcon}><Folder01Icon size={20} aria-hidden="true" /></span><div><strong>Back to the cases</strong><p>Pick up the next detail.</p></div><ArrowRight01Icon size={17} aria-hidden="true" /></Link>
        <Link href={`/dashboard?tab=${profile.role === "rescuer" ? "search" : "reviews"}`}><span className={styles.shortcutIcon} data-color="cyan">{profile.role === "rescuer" ? <Search01Icon size={20} aria-hidden="true" /> : <CheckmarkCircle01Icon size={20} aria-hidden="true" />}</span><div><strong>{profile.role === "rescuer" ? "Follow a new clue" : "Review the next lead"}</strong><p>{profile.role === "rescuer" ? "Start with a photograph or frame." : "Bring your judgment to the evidence."}</p></div><ArrowRight01Icon size={17} aria-hidden="true" /></Link>
      </section>}
      <div className={styles.pageNote}><Shield01Icon size={15} aria-hidden="true" /><p>Your profile is shared with your workspace. Your access follows your assigned role.</p></div>
      {editorMobile ? <Drawer open={editorOpen} onOpenChange={changeOpen} dismissible={!saving}><DrawerContent className={styles.editorDrawer} onOpenAutoFocus={(event) => { event.preventDefault(); document.getElementById("profile-display-name")?.focus(); }} onCloseAutoFocus={(event) => { event.preventDefault(); returnFocus.current?.focus(); }}>
        <div className={styles.editorHeading}><div><DrawerTitle>Edit your profile</DrawerTitle><DrawerDescription>A recognizable name and a face that feels like you.</DrawerDescription></div><DrawerClose asChild><Button variant="ghost" size="icon" disabled={saving} aria-label="Close profile editor"><Cancel01Icon size={18} /></Button></DrawerClose></div>{editor}
      </DrawerContent></Drawer> : <Dialog open={editorOpen} onOpenChange={changeOpen}><DialogContent className={styles.editorDialog} onCloseAutoFocus={(event) => { event.preventDefault(); returnFocus.current?.focus(); }}>
        <div className={styles.editorHeading}><div><DialogTitle>Edit your profile</DialogTitle><DialogDescription>A recognizable name and a face that feels like you.</DialogDescription></div></div>{editor}
      </DialogContent></Dialog>}
    </div>
  );
}

export function Account() {
  const { profile, session, refreshProfile } = useAuth();
  const save = useMutation({
    mutationFn: (changes: ProfileChanges) => api<Profile>("/api/me", {
      method: "PATCH",
      body: JSON.stringify({ ...changes, avatar_shape: profile?.avatar_shape || "squircle", avatar_style: profile?.avatar_style || "3d" }),
    }),
    onSuccess: async () => { await refreshProfile(true); },
  });
  if (!profile) return <Loading label="Loading your account…" />;
  return <AccountProfileView key={profile.id} profile={profile} email={session?.user.email}
    onSave={async (changes) => { await save.mutateAsync(changes); }} />;
}
