"use client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { api } from "@/lib/api";
import type { Person, Review, Profile, PersonDetail } from "@/lib/types";
export function useCases() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["cases", profile?.id],
    queryFn: ({ signal }) => api<Person[]>("/api/cases", { signal }),
    enabled: Boolean(profile && profile.role !== "pending"),
  });
}
export function useReviews() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["reviews", profile?.id],
    queryFn: ({ signal }) => api<Review[]>("/api/reviews", { signal }),
    enabled: Boolean(profile && profile.role !== "pending"),
    staleTime: 30000,
  });
}
export function useCase(id: string) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["case", profile?.id, id],
    queryFn: ({ signal }) =>
      api<PersonDetail>(`/api/cases/${encodeURIComponent(id)}`, { signal }),
    enabled: Boolean(profile && profile.role !== "pending"),
    staleTime: 30000,
  });
}
export function useTeam() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ["team", profile?.id],
    queryFn: ({ signal }) => api<Profile[]>("/api/team", { signal }),
    enabled: profile?.role === "admin",
  });
}
