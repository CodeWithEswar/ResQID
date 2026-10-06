"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Overview } from "@/components/workspace/overview";
import { Cases } from "@/components/workspace/cases";
import { FaceSearch } from "@/components/workspace/face-capture";
import { Reviews } from "@/components/workspace/reviews";
import { Account, Team } from "@/components/workspace/account";
import { Loading } from "@/components/workspace/shared";
const aliases: Record<string, string> = {
  incidents: "cases",
  registry: "cases",
  biometrics: "search",
  settings: "account",
  candidates: "reviews",
};
function Workspace() {
  const params = useSearchParams();
  const requested = params.get("tab") || "overview";
  const tab = aliases[requested] || requested;
  const active = [
    "overview",
    "cases",
    "search",
    "reviews",
    "account",
    "team",
  ].includes(tab)
    ? tab
    : "overview";
  return (
    <AppShell activeTab={active}>
      {active === "cases" ? (
        <Cases />
      ) : active === "search" ? (
        <FaceSearch />
      ) : active === "reviews" ? (
        <Reviews />
      ) : active === "account" ? (
        <Account />
      ) : active === "team" ? (
        <Team />
      ) : (
        <Overview />
      )}
    </AppShell>
  );
}
export default function DashboardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Workspace />
    </Suspense>
  );
}
