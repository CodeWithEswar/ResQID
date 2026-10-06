"use client";
import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loading } from "@/components/workspace/shared";
function Callback() {
  const params = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    let active = true;
    async function finish() {
      try {
        if (!supabase)
          throw new Error("The workspace connection is not configured.");
        const providerError =
          params.get("error_description") || params.get("error");
        if (providerError) throw new Error(providerError);
        // The browser client automatically exchanges the PKCE code on initialization.
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data.session)
          throw new Error("Sign-in could not be completed. Please try again.");
        const requested = params.get("next") ?? "/dashboard";
        if (active)
          router.replace(
            requested.startsWith("/") &&
              !requested.startsWith("//") &&
              !requested.includes("\\")
              ? requested
              : "/dashboard",
          );
      } catch (e) {
        if (active)
          router.replace(
            `/login?error=${encodeURIComponent((e as Error).message)}`,
          );
      }
    }
    void finish();
    return () => {
      active = false;
    };
  }, [params, router]);
  return <Loading label="Completing your sign-in…" />;
}
export default function CallbackPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Callback />
    </Suspense>
  );
}
