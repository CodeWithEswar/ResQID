"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import type { Profile } from "@/lib/types";
type Auth = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string;
  refreshProfile: (silent?: boolean) => Promise<void>;
};
const Context = createContext<Auth>({
  session: null,
  profile: null,
  loading: true,
  error: "",
  refreshProfile: async () => {},
});
export const useAuth = () => useContext(Context);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState("");
  const current = useRef<Session | null>(null);
  const revision = useRef(0);
  const mounted = useRef(false);
  const queryClient = useQueryClient();
  const refreshProfile = useCallback(async (silent = false) => {
    const id = current.current?.user.id;
    const run = ++revision.current;
    if (!id) return;
    if (!silent) setLoading(true);
    setError("");
    try {
      const result = await api<Profile>("/api/me");
      if (mounted.current && run === revision.current && result.id === id)
        setProfile(result);
    } catch (e) {
      if (mounted.current && run === revision.current) {
        setProfile(null);
        setError((e as Error).message);
      }
    } finally {
      if (mounted.current && run === revision.current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!supabase) return;
    mounted.current = true;
    let eventReceived = false;
    const receive = (next: Session | null) => {
      if (!mounted.current) return;
      const changed = current.current?.user.id !== next?.user.id;
      current.current = next;
      setSession(next);
      if (changed) {
        revision.current++;
        setProfile(null);
        setError("");
        setLoading(Boolean(next));
        void queryClient.cancelQueries();
        queryClient.clear();
        if (next)
          setTimeout(() => {
            if (mounted.current) void refreshProfile();
          }, 0);
      } else if (!next) setLoading(false);
    };
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      eventReceived = true;
      receive(next);
    });
    supabase.auth.getSession().then(({ data, error }) => {
      if (!eventReceived) receive(data.session);
      if (mounted.current && error) {
        setError(error.message);
        setLoading(false);
      }
    });
    const invalidate = () => {
      mounted.current = false;
      revision.current++;
      current.current = null;
    };
    return () => {
      invalidate();
      data.subscription.unsubscribe();
    };
  }, [queryClient, refreshProfile]);
  return (
    <Context.Provider
      value={{ session, profile, loading, error, refreshProfile }}
    >
      {children}
    </Context.Provider>
  );
}
