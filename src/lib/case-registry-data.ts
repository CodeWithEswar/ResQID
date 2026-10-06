import type { CaseStatus, Person } from "./types";
import { workspaceDay } from "./dashboard-data";
export const caseStatuses: CaseStatus[] = [
  "pending",
  "urgent",
  "ongoing",
  "completed",
  "closed",
];
export type CaseFilters = {
  statuses: CaseStatus[];
  days: number;
  age: "all" | "child" | "adult" | "unknown";
};
export type CaseSort = "newest" | "oldest" | "name" | "urgent";
export const emptyCaseFilters: CaseFilters = {
  statuses: [],
  days: 0,
  age: "all",
};
export function filterCases(
  cases: Person[],
  search: string,
  filters: CaseFilters,
  sort: CaseSort,
  now = new Date(),
) {
  const term = search.trim().toLocaleLowerCase();
  const today = workspaceDay(now);
  const start = today
    ? new Date(`${today}T00:00:00Z`).getTime() -
      Math.max(0, filters.days - 1) * 86400000
    : NaN;
  const filtered = cases.filter((person) => {
    if (filters.statuses.length && !filters.statuses.includes(person.status))
      return false;
    if (
      term &&
      !`${person.name} ${person.last_seen} ${person.id}`
        .toLocaleLowerCase()
        .includes(term)
    )
      return false;
    if (filters.age === "unknown" && person.age !== null) return false;
    if (filters.age === "child" && (person.age === null || person.age >= 18))
      return false;
    if (filters.age === "adult" && (person.age === null || person.age < 18))
      return false;
    if (filters.days) {
      const day = workspaceDay(person.created_at);
      if (
        !day ||
        !today ||
        day > today ||
        new Date(`${day}T00:00:00Z`).getTime() < start
      )
        return false;
    }
    return true;
  });
  const stamp = (person: Person) => Date.parse(person.created_at) || 0;
  return filtered.sort((a, b) => {
    if (sort === "name")
      return a.name.localeCompare(b.name) || a.id.localeCompare(b.id);
    if (
      sort === "urgent" &&
      (a.status === "urgent") !== (b.status === "urgent")
    )
      return a.status === "urgent" ? -1 : 1;
    return (
      (sort === "oldest" ? stamp(a) - stamp(b) : stamp(b) - stamp(a)) ||
      a.id.localeCompare(b.id)
    );
  });
}
