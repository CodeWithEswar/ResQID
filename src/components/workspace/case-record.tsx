"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft01Icon, ArrowRight01Icon, Calendar03Icon, Cancel01Icon,
  Copy01Icon, File01Icon, Image01Icon, Location01Icon, Maximize01Icon,
  PlusSignIcon, RefreshIcon, Shield01Icon, UserIcon, ZoomInAreaIcon,
  ZoomOutAreaIcon,
} from "hugeicons-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useCase } from "@/hooks/use-workspace";
import { useIsMobile } from "@/hooks/use-mobile";
import { api } from "@/lib/api";
import type { CaseStatus, Person, PersonDetail, Reference } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CaseAvatar } from "@/components/ui/gradient-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription, DrawerClose } from "@/components/ui/drawer";
import { Artwork, ErrorMessage, Status, dateLabel } from "./shared";
import { FaceCapture } from "./face-capture";
import { EarEvidence } from "./ear-evidence";
import styles from "./case-record.module.css";

const statuses: CaseStatus[] = ["pending", "urgent", "ongoing", "completed", "closed"];
const authorityLabels: Record<string, string> = {
  self: "Personal consent", family: "Family consent",
  authority: "Official authority", research: "Research consent",
};
const label = (value: string) => value[0].toUpperCase() + value.slice(1);

function ReferencePhoto({ reference, name, className, onRefresh }: {
  reference: Reference; name: string; className?: string; onRefresh: () => void;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  if (failedSource === reference.photo_url) return (
    <div className={styles.imageError} role="status">
      <Image01Icon size={28} aria-hidden="true" />
      <strong>This photograph couldn’t load.</strong>
      <p>Refresh the record to renew its secure link.</p>
      <Button variant="outline" onClick={onRefresh}><RefreshIcon size={15} />Refresh record</Button>
    </div>
  );
  return (
    // Signed reference URLs are temporary and remain unaltered for inspection.
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src={reference.photo_url} alt={`${name}, ${reference.modality} reference`} onError={() => setFailedSource(reference.photo_url)} />
  );
}

function ReferenceGallery({ person, onRefresh, onAdd, canEdit }: {
  person: PersonDetail; onRefresh: () => void; onAdd: () => void; canEdit: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [inspectOpen, setInspectOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const inspectTrigger = useRef<HTMLButtonElement>(null);
  const references = person.references;
  const selectedIndex = Math.max(0, references.findIndex((item) => item.id === selectedId));
  const selected = references[selectedIndex];
  function choose(index: number) {
    if (!references.length) return;
    setSelectedId(references[(index + references.length) % references.length].id);
    setZoom(1);
  }
  const navigation = (
    <div className={styles.galleryNav}>
      <Button variant="ghost" size="icon" aria-label="Previous reference" disabled={references.length < 2} onClick={() => choose(selectedIndex - 1)}><ArrowLeft01Icon size={17} /></Button>
      <span aria-live="polite">{selectedIndex + 1} <span>/ {references.length}</span></span>
      <Button variant="ghost" size="icon" aria-label="Next reference" disabled={references.length < 2} onClick={() => choose(selectedIndex + 1)}><ArrowRight01Icon size={17} /></Button>
    </div>
  );
  return (
    <section className={`${styles.panel} ${styles.gallery}`} aria-labelledby="case-references-heading">
      <div className={styles.sectionHeading}>
        <div><span className={styles.kicker}>THE REFERENCE RECORD</span><h2 id="case-references-heading">Reference photographs</h2></div>
        <span className={styles.count}>{references.length}</span>
      </div>
      {selected ? <>
        <div className={styles.photoStage}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.photoAtmosphere} src={selected.photo_url} alt="" aria-hidden="true" />
          <ReferencePhoto reference={selected} name={person.name} className={styles.mainPhoto} onRefresh={onRefresh} />
          <span className={styles.photoTag}><Image01Icon size={13} aria-hidden="true" />{label(selected.modality)} reference</span>
          <Button ref={inspectTrigger} className={styles.expandPhoto} variant="ghost" size="icon" aria-label="View full-size reference" onClick={() => { setZoom(1); setInspectOpen(true); }}><Maximize01Icon size={17} /></Button>
        </div>
        <div className={styles.photoCaption}><div><strong>{label(selected.modality)} reference</strong><span>Added {dateLabel(selected.created_at)}</span></div>{navigation}</div>
        {references.length > 1 && <div className={styles.thumbnails} aria-label="Reference photographs">
          {references.map((reference, index) => <button key={reference.id} type="button" aria-label={`View ${reference.modality} reference ${index + 1}`} aria-pressed={selected.id === reference.id} onClick={() => choose(index)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={reference.photo_url} alt="" loading="lazy" /><span>{index + 1}</span>
          </button>)}
        </div>}
        <p className={styles.galleryNote}><Shield01Icon size={14} aria-hidden="true" />Original colors. Full context. Available for review.</p>
        <Dialog open={inspectOpen} onOpenChange={setInspectOpen}>
          <DialogContent className={styles.lightbox} onCloseAutoFocus={(event) => { event.preventDefault(); inspectTrigger.current?.focus(); }} onKeyDown={(event) => {
            if (event.key === "ArrowLeft") { event.preventDefault(); choose(selectedIndex - 1); }
            if (event.key === "ArrowRight") { event.preventDefault(); choose(selectedIndex + 1); }
          }}>
            <div className={styles.lightboxHeading}><DialogTitle>{person.name} · {label(selected.modality)} reference</DialogTitle><DialogDescription>Original photograph · {dateLabel(selected.created_at)}</DialogDescription></div>
            <div className={styles.lightboxViewport} tabIndex={0} aria-label="Reference photograph. Scroll to inspect when zoomed.">
              <div className={styles.lightboxCanvas} style={{ width: `${zoom * 100}%`, height: `calc((var(--photo-height) - 2px) * ${zoom})` }}><ReferencePhoto reference={selected} name={person.name} className={styles.inspectedPhoto} onRefresh={onRefresh} /></div>
            </div>
            <div className={styles.lightboxToolbar}>{navigation}<div className={styles.zoomControls}>
              <Button variant="ghost" size="icon" aria-label="Zoom out" disabled={zoom <= 1} onClick={() => setZoom((value) => Math.max(1, value - .25))}><ZoomOutAreaIcon size={18} /></Button>
              <output aria-live="polite">{Math.round(zoom * 100)}%</output>
              <Button variant="ghost" size="icon" aria-label="Zoom in" disabled={zoom >= 2.5} onClick={() => setZoom((value) => Math.min(2.5, value + .25))}><ZoomInAreaIcon size={18} /></Button>
              <Button variant="ghost" className="px-2 text-xs" onClick={() => setZoom(1)}>Reset</Button>
            </div></div>
          </DialogContent>
        </Dialog>
      </> : <div className={styles.galleryEmpty}>
        <Artwork name="workspace/capture" />
        <h3>A clearer picture starts here.</h3><p>Add an authorized reference so your team has evidence to compare.</p>
        {canEdit && <Button variant="outline" onClick={onAdd}><PlusSignIcon size={16} />Add first reference</Button>}
      </div>}
    </section>
  );
}

export function CaseRecordView({ person, canEdit = false, updating = false, refreshing = false, updateError, onStatusChange, onRefresh, onEnrolled }: {
  person: PersonDetail; canEdit?: boolean; updating?: boolean; refreshing?: boolean;
  updateError?: Error | null; onStatusChange: (status: CaseStatus) => void;
  onRefresh: () => void; onEnrolled: () => void;
}) {
  const mobile = useIsMobile();
  const addTrigger = useRef<HTMLButtonElement>(null);
  const drawerClose = useRef<HTMLButtonElement>(null);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [earOpen, setEarOpen] = useState(false);
  const faceCount = person.references.filter((reference) => reference.modality === "face").length;
  async function copyId() {
    try { await navigator.clipboard.writeText(person.id); toast.success("Case ID copied."); }
    catch { toast.error("Couldn’t copy the ID. You can select it below."); }
  }
  const enrollment = <FaceCapture compact purpose="enroll" caseId={person.id} onEnrolled={onEnrolled} />;
  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}><Link href="/dashboard?tab=cases"><ArrowLeft01Icon size={15} aria-hidden="true" />Case registry</Link><span>/</span><span>Case record</span></div>
      <header className={styles.hero}>
        <div className={styles.identity}>
          <CaseAvatar name={person.name} id={person.id} size="xl" className={styles.avatar} />
          <div className={styles.identityCopy}><p className={styles.kicker}>CASE RECORD <span>#{person.id.slice(0, 8)}</span></p><h1>{person.name}</h1><p className={styles.registered}><Calendar03Icon size={14} aria-hidden="true" />Registered {dateLabel(person.created_at)}</p></div>
        </div>
        <div className={styles.heroActions}>
          <Status value={person.status} />
          <Button variant="outline" size="icon" aria-label="Refresh case record" disabled={refreshing} onClick={onRefresh}><RefreshIcon size={17} className={refreshing ? "animate-spin motion-reduce:animate-none" : ""} /></Button>
          {canEdit && <Button ref={addTrigger} onClick={() => setEnrollOpen(true)}><PlusSignIcon size={17} aria-hidden="true" /><span>Add reference</span></Button>}
        </div>
        <div className={styles.summaryStrip}>
          <div><span className={styles.summaryIcon} data-color="violet"><UserIcon size={17} aria-hidden="true" /></span><div><span>Age</span><strong>{person.age === null ? "Not recorded" : `${person.age} years old`}</strong></div></div>
          <div><span className={styles.summaryIcon} data-color="cyan"><Location01Icon size={17} aria-hidden="true" /></span><div><span>Last-seen location</span><strong>{person.last_seen || "Not recorded"}</strong></div></div>
          <div><span className={styles.summaryIcon} data-color="amber"><Image01Icon size={17} aria-hidden="true" /></span><div><span>Reference record</span><strong>{person.references.length} {person.references.length === 1 ? "photograph" : "photographs"}<small>{faceCount} face {faceCount === 1 ? "reference" : "references"}</small></strong></div></div>
        </div>
      </header>
      <ErrorMessage error={updateError} />
      <div className={styles.contentGrid}>
        <section className={`${styles.panel} ${styles.caseInfo}`} aria-labelledby="case-details-heading">
          <div className={styles.sectionHeading}><div><span className={styles.kicker}>THE DETAILS THAT MATTER</span><h2 id="case-details-heading">Person & case details</h2></div><File01Icon size={20} className={styles.sectionIcon} aria-hidden="true" /></div>
          <dl className={styles.details}>
            <div><dt><UserIcon size={14} aria-hidden="true" />Full name</dt><dd>{person.name}</dd></div>
            <div><dt><Calendar03Icon size={14} aria-hidden="true" />Registered</dt><dd>{dateLabel(person.created_at)}</dd></div>
            <div><dt><Shield01Icon size={14} aria-hidden="true" />Consent / authority</dt><dd>{authorityLabels[person.consent_basis] || person.consent_basis || "Not recorded"}</dd></div>
            <div><dt><Image01Icon size={14} aria-hidden="true" />Evidence on record</dt><dd>{person.references.length} enrolled {person.references.length === 1 ? "reference" : "references"}</dd></div>
            <div className={styles.caseId}><dt>Unique case ID<Button variant="ghost" size="iconSm" aria-label="Copy case ID" onClick={() => void copyId()}><Copy01Icon size={14} /></Button></dt><dd>{person.id}</dd></div>
          </dl>
          <div className={styles.notes}><div><File01Icon size={15} aria-hidden="true" /><h3>Case notes</h3></div><p>{person.notes || "No notes have been recorded for this case."}</p></div>
          <div className={styles.statusControl}>
            <div><h3>Case status</h3><p>{updating ? "Saving your update…" : canEdit ? "Keep your team’s next step clear." : "Current progress recorded by your team."}</p></div>
            {canEdit ? <Select value={person.status} disabled={updating} onValueChange={(value) => onStatusChange(value as CaseStatus)}><SelectTrigger aria-label="Update case status" className={styles.statusSelect}><SelectValue /></SelectTrigger><SelectContent>{statuses.map((status) => <SelectItem value={status} key={status}>{label(status)}</SelectItem>)}</SelectContent></Select> : <Status value={person.status} />}
          </div>
        </section>
        <ReferenceGallery person={person} canEdit={canEdit} onAdd={() => setEnrollOpen(true)} onRefresh={onRefresh} />
      </div>
      {canEdit && <section className={styles.evidenceBanner} aria-labelledby="case-evidence-heading">
        <Artwork name="workspace/capture" className={styles.evidenceArt} />
        <div className={styles.evidenceCopy}><span className={styles.kicker}>BUILD THE REFERENCE RECORD</span><h2 id="case-evidence-heading">A little more context. A clearer next step.</h2><p>Enroll a face from a photograph, video, or camera frame.</p></div>
        <Button variant="outline" onClick={() => setEnrollOpen(true)}><PlusSignIcon size={16} aria-hidden="true" />Add face reference</Button>
      </section>}
      {canEdit && <details className={styles.additionalEvidence} open={earOpen} onToggle={(event) => setEarOpen(event.currentTarget.open)}><summary><span><Image01Icon size={17} aria-hidden="true" /><strong>Additional ear evidence</strong><small>For human inspection</small></span><PlusSignIcon size={17} aria-hidden="true" /></summary>{earOpen && <EarEvidence caseId={person.id} />}</details>}
      <div className={styles.footerNote}><Shield01Icon size={16} aria-hidden="true" /><p>Reference photographs are shared through secure, temporary links. Refresh the record if a link expires.</p><Button variant="ghost" onClick={onRefresh} disabled={refreshing}>Refresh<RefreshIcon size={14} aria-hidden="true" /></Button></div>
      {canEdit && (mobile ? <Drawer open={enrollOpen} onOpenChange={setEnrollOpen}><DrawerContent className={styles.enrollmentDrawer} onOpenAutoFocus={(event) => { event.preventDefault(); drawerClose.current?.focus(); }} onCloseAutoFocus={(event) => { event.preventDefault(); addTrigger.current?.focus(); }}>
        <div className={styles.enrollmentHeading}><div><DrawerTitle>Enroll a face reference</DrawerTitle><DrawerDescription>Add authorized evidence for {person.name}.</DrawerDescription></div><DrawerClose asChild><Button ref={drawerClose} variant="ghost" size="icon" aria-label="Close enrollment"><Cancel01Icon size={18} /></Button></DrawerClose></div><div className={styles.enrollmentBody}>{enrollment}</div>
      </DrawerContent></Drawer> : <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}><DialogContent className={styles.enrollmentDialog} onCloseAutoFocus={(event) => { event.preventDefault(); addTrigger.current?.focus(); }}><div className={styles.enrollmentHeading}><div><DialogTitle>Enroll a face reference</DialogTitle><DialogDescription>Add authorized evidence for {person.name}.</DialogDescription></div></div>{enrollment}</DialogContent></Dialog>)}
    </div>
  );
}

export function CaseRecord({ id }: { id: string }) {
  const query = useCase(id);
  const { profile } = useAuth();
  const client = useQueryClient();
  const update = useMutation({
    mutationFn: (status: CaseStatus) => api<Person>(`/api/cases/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: async () => {
      toast.success("Case status updated.");
      await Promise.all([client.invalidateQueries({ queryKey: ["case"] }), client.invalidateQueries({ queryKey: ["cases"] })]);
    },
    onError: () => toast.error("Case status couldn’t be updated. Please try again."),
  });
  if (query.isPending) return <div className={styles.loading} role="status" aria-label="Loading case record"><Skeleton className="h-5 w-36" /><Skeleton className="h-52 w-full rounded-2xl" /><div className={styles.contentGrid}><Skeleton className="h-96 rounded-2xl" /><Skeleton className="h-96 rounded-2xl" /></div><span className="sr-only">Loading case record…</span></div>;
  if (!query.data) return <div className={styles.loadError}><Artwork name="access/workspace" /><h1>Let’s bring this record back.</h1><ErrorMessage error={query.error || "Case not found."} /><div><Button variant="outline" onClick={() => void query.refetch()}><RefreshIcon size={16} />Try again</Button><Button variant="ghost" asChild><Link href="/dashboard?tab=cases">Back to cases</Link></Button></div></div>;
  return <CaseRecordView key={id} person={query.data} canEdit={profile?.role === "rescuer" || profile?.role === "admin"} updating={update.isPending} refreshing={query.isFetching} updateError={update.error || query.error} onStatusChange={(status) => { if (status !== query.data.status) update.mutate(status); }} onRefresh={() => void query.refetch()} onEnrolled={() => { toast.success("Reference photograph enrolled."); void client.invalidateQueries({ queryKey: ["case"] }); }} />;
}
