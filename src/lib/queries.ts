import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMe, fetchReceivingAccounts, fetchHistory } from "./api";

// ── Query keys — centralised so invalidation is consistent ───────────────────
export const QK = {
  me: ["me"] as const,
  receivingAccounts: ["receivingAccounts"] as const,
  history: (page: number, size: number) => ["history", page, size] as const,
};

// ── fetchMe ───────────────────────────────────────────────────────────────────
export function useMe() {
  return useQuery({
    queryKey: QK.me,
    queryFn: fetchMe,
    staleTime: 5 * 60 * 1000, // 5 min — session is stable
    retry: 1,
  });
}

// ── fetchReceivingAccounts ────────────────────────────────────────────────────
// Bank accounts never change mid-session → cache forever, fetch once.
export function useReceivingAccounts() {
  return useQuery({
    queryKey: QK.receivingAccounts,
    queryFn: fetchReceivingAccounts,
    staleTime: Infinity, // never re-fetch unless manually invalidated
    gcTime: 60 * 60 * 1000, // keep in memory for 1 h
    retry: 2,
  });
}

// ── fetchHistory ──────────────────────────────────────────────────────────────
// Paginated — each page is its own cache entry.
// Short staleTime so new deposits appear quickly.
export function useHistory(page = 0, pageSize = 10) {
  return useQuery({
    queryKey: QK.history(page, pageSize),
    queryFn: () => fetchHistory(page, pageSize),
    staleTime: 30 * 1000, // 30 s — refreshes after a deposit
    placeholderData: (prev) => prev, // keeps old page visible while next loads
    retry: 1,
  });
}

// ── Utility: invalidate history after a deposit ───────────────────────────────
// Call this inside your deposit submit success handler so history refreshes.
//
//   const invalidateHistory = useInvalidateHistory()
//   await submitDeposit(...)
//   invalidateHistory()
//
export function useInvalidateHistory() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["history"] });
}
