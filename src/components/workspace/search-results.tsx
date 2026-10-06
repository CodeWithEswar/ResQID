"use client";

import Link from "next/link";
import { ArrowRight01Icon, Location01Icon, Shield01Icon } from "hugeicons-react";
import { GradientAvatar } from "@/components/ui/gradient-avatar";
import { Badge } from "@/components/ui/badge";
import type { SearchResult } from "@/lib/types";
import { EmptyState } from "./shared";
import styles from "./face-search.module.css";

export function SearchResults({ result }: { result: SearchResult }) {
  return <section className={styles.results} aria-labelledby="search-results-title" aria-live="polite">
    <div className={styles.resultsHeading}><div><p className={styles.kicker}>REGISTRY RESULTS</p><h2 id="search-results-title">Possible leads <span>{result.candidates.length}</span></h2></div><Link href="/dashboard?tab=reviews" className={styles.reviewLink}>Review queue <ArrowRight01Icon size={16} /></Link></div>
    <div className={styles.reviewNotice}><Shield01Icon size={19} aria-hidden="true" /><div><strong>Every lead needs an independent review.</strong><p>Similarity scores rank candidates; they are not identity probabilities. Disaster identity accuracy is not validated.</p></div></div>
    <p className={styles.resultMessage}>{result.message}</p>
    {result.warnings?.map(warning => <p key={warning} className={styles.warning}>{warning}</p>)}
    <div className={styles.leads}>{result.candidates.length ? result.candidates.map((candidate, index) => <Link key={candidate.id} href={`/cases/${encodeURIComponent(candidate.person_id)}`} className={styles.lead}>
      <div className={styles.leadPerson}><span className={styles.rank}>{String(index + 1).padStart(2, "0")}</span><GradientAvatar name={candidate.person?.name || "Case lead"} id={candidate.person_id} glow={false} size="lg" /><div><strong>{candidate.person?.name || "Case lead"}</strong><small><Location01Icon size={13} aria-hidden="true" />{candidate.person?.last_seen || "Location not recorded"}</small><small>{candidate.person?.age == null ? "Age not recorded" : `${candidate.person.age} years`} · Case {candidate.person_id.slice(0, 8)}</small></div></div>
      <div className={styles.leadScore}><span>Similarity</span><strong>{candidate.score.toFixed(3)}</strong></div><Badge className={styles.leadBadge} variant="warning" dot>Pending review</Badge><ArrowRight01Icon className={styles.leadArrow} size={18} aria-hidden="true" />
    </Link>) : <EmptyState title="No leads returned." description="No registered reference met the current search thresholds. Try another clear photograph." artwork="workspace/review" />}</div>
    <details className={styles.method}><summary>Search method details</summary><p>Calibration: {result.calibration}. Thresholds: {Object.entries(result.thresholds).map(([key, value]) => `${key.replaceAll("_", " ")}: ${value}`).join(" · ") || "Not supplied"}.</p></details>
  </section>;
}
