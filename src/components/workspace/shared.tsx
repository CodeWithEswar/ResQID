import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
export function Brand({
  compact = false,
  large = false,
}: {
  compact?: boolean;
  large?: boolean;
}) {
  return (
    <Link
      href="/"
      className={`brand${large ? " brand-large" : ""}`}
      aria-label="ResQ home"
    >
      <Image
        src="/assets/resq-mark.svg"
        alt=""
        width={large ? 48 : 36}
        height={large ? 48 : 36}
      />
      <span>
        ResQ<span className="brand-dot">.</span>
      </span>
      {!compact && <span className="brand-caption">SEARCH & RECONNECT</span>}
    </Link>
  );
}
export function Artwork({
  name,
  alt = "",
  className = "",
}: {
  name: string;
  alt?: string;
  className?: string;
}) {
  return (
    <Image
      src={`/assets/${name}.webp`}
      alt={alt}
      width={640}
      height={640}
      className={`artwork ${className}`}
    />
  );
}
export function EmptyState({
  title,
  description,
  artwork = "workspace/workspace",
  action,
}: {
  title: string;
  description: string;
  artwork?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <Artwork name={artwork} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function ErrorMessage({ error }: { error?: Error | string | null }) {
  return error ? (
    <div role="alert" className="error-message">
      {typeof error === "string" ? error : error.message}
    </div>
  ) : null;
}
export function Loading({
  label = "Loading your workspace…",
}: {
  label?: string;
}) {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" />
      {label}
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Status({ value }: { value: string }) {
  const variant = ["completed", "verified"].includes(value)
    ? "success"
    : ["urgent", "rejected"].includes(value)
      ? "destructive"
      : value === "pending"
        ? "warning"
        : value === "ongoing"
          ? "cyan"
          : "secondary";
  return (
    <Badge
      variant={variant}
      dot
      className="shrink-0 whitespace-nowrap text-[10px] font-medium capitalize"
    >
      {value.replaceAll("_", " ")}
    </Badge>
  );
}
export function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      });
}
