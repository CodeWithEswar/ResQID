"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase";
import { AccessGate } from "./access-gate";
import { WorkspaceFrame } from "./workspace-frame";
import { useReviews } from "@/hooks/use-workspace";
import { Brand, Artwork, Loading } from "@/components/workspace/shared";
export function AppShell({
  activeTab = "overview",
  children,
}: {
  activeTab?: string;
  children: ReactNode;
}) {
  const { session, profile, loading, error, refreshProfile } = useAuth();
  const [signOutError, setSignOutError] = useState("");
  const reviews = useReviews();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!loading && !session && supabase)
      router.replace(
        `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
      );
  }, [loading, session, router, pathname]);
  async function signOut() {
    const result = await supabase?.auth.signOut();
    if (result?.error) setSignOutError(result.error.message);
    else router.replace("/login");
  }
  if (loading) return <Loading />;
  if (!supabase)
    return (
      <div className="access-page">
        <Brand />
        <Artwork name="access/workspace" />
        <h1>Connect your workspace.</h1>
        <p>Set the web environment variables to connect ResQ to your team.</p>
        <Link href="/" className="btn secondary">
          Back to introduction
        </Link>
      </div>
    );
  if (!session) return <Loading label="Opening sign-in…" />;
  if (!profile || profile.role === "pending")
    return (
      <AccessGate
        pending={profile?.role === "pending"}
        email={session.user.email}
        error={error || signOutError}
        onRefresh={() => refreshProfile(true)}
        onSignOut={signOut}
      />
    );
  return (
    <WorkspaceFrame
      profile={profile}
      activeTab={activeTab}
      pendingReviews={
        reviews.data?.filter((item) => item.status === "pending").length
      }
      error={signOutError}
      onSignOut={signOut}
    >
      {children}
    </WorkspaceFrame>
  );
}
