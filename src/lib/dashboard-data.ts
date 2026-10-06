import type { Person, Review } from "./types";

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
export function workspaceDay(value: string | Date): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = dayFormatter.formatToParts(date);
  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
export function activitySeries(
  cases: Pick<Person, "created_at">[],
  reviews: Pick<Review, "created_at">[],
  days: number,
  now = new Date(),
) {
  const anchor = workspaceDay(now);
  if (!anchor || !Number.isInteger(days) || days < 1 || days > 90) return [];
  const midnight = new Date(`${anchor}T00:00:00Z`).getTime();
  const data = Array.from({ length: days }, (_, index) => ({
    date: new Date(midnight - (days - index - 1) * 86400000)
      .toISOString()
      .slice(0, 10),
    cases: 0,
    reviews: 0,
  }));
  const byDate = new Map(data.map((row) => [row.date, row]));
  for (const item of cases) {
    const day = workspaceDay(item.created_at);
    const row = day ? byDate.get(day) : undefined;
    if (row) row.cases++;
  }
  for (const item of reviews) {
    const day = workspaceDay(item.created_at);
    const row = day ? byDate.get(day) : undefined;
    if (row) row.reviews++;
  }
  return data;
}
export function dashboardSummary(cases: Person[], reviews: Review[]) {
  return {
    registered: cases.length,
    open: cases.filter((item) => !["completed", "closed"].includes(item.status))
      .length,
    pending: reviews.filter((item) => item.status === "pending").length,
    verified: reviews.filter((item) => item.status === "verified").length,
    rejected: reviews.filter((item) => item.status === "rejected").length,
    completed: cases.filter((item) =>
      ["completed", "closed"].includes(item.status),
    ).length,
  };
}
export function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  );
}
export function chartDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
