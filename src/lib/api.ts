// ── lib/api.ts ────────────────────────────────────────────────────────────────
// All API calls go through Next.js proxy routes (/api/...).
// No tokens, no NestJS URL, no hardcoded credentials here.
// Auth is handled server-side via the httpOnly session cookie —
// the browser attaches it automatically on every same-origin request.
// ─────────────────────────────────────────────────────────────────────────────

import type { BulkReceipt } from "@/store/deposit.store";

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData;

  const res = await fetch(path, {
    ...init,
    credentials: "same-origin", // ensures cookie is sent automatically
    headers: {
      ...(init?.headers ?? {}),
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    },
  });

  const text = await res.text();
  let payload: any = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!res.ok) {
    const message =
      payload?.message ??
      payload?.reason ??
      payload?.error ??
      `Request failed: ${res.status}`;
    throw new Error(message);
  }

  return (payload ?? {}) as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function fetchMe() {
  return apiFetch<{ userId: string; email: string }>("/api/auth/me");
}

// ── Single deposit ────────────────────────────────────────────────────────────

export async function submitSingleDeposit(payload: {
  amount: number;
  paymentMethod: string;
  verificationMethod: string;
  rawProof?: string | null;
  accountNumber?: string;
}) {
  console.log(payload);
  return apiFetch<any>("/api/deposit", {
    method: "POST",
    body: JSON.stringify({
      amount: payload.amount,
      paymentMethod: payload.paymentMethod,
      verificationMethod: payload.verificationMethod,
      rawProof: payload.rawProof ?? null,
      accountNumber: payload.accountNumber,
    }),
  });
}

// ── Bulk deposit ──────────────────────────────────────────────────────────────

export async function submitBulkDeposit(payload: {
  declaredTotal: number;
  paymentMethod: string;
  verificationMethod: string;
  receipts: BulkReceipt[];
}) {
  return apiFetch<any>("/api/deposit/bulk", {
    method: "POST",
    body: JSON.stringify({
      declaredTotal: payload.declaredTotal,
      paymentMethod: payload.paymentMethod,
      verificationMethod: payload.verificationMethod,
      receipts: payload.receipts.map((r) => ({
        rawProof: r.rawProof,
        amount: r.amount,
      })),
    }),
  });
}

// ── History ───────────────────────────────────────────────────────────────────

const HISTORY_DEFAULT_PAGE_SIZE = 10;

export async function fetchHistory(
  page = 0,
  pageSize = HISTORY_DEFAULT_PAGE_SIZE,
) {
  const data = await apiFetch<any>(
    `/api/deposit/history?page=${page}&pageSize=${pageSize}`,
  );

  const safePageSize = data.pageSize ?? pageSize;
  const safePage = data.page ?? page;
  const total = typeof data.total === "number" ? data.total : 0;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const inferredHasMore = (safePage + 1) * safePageSize < total;
  const hasMore =
    typeof data.hasMore === "boolean" ? data.hasMore : inferredHasMore;

  return {
    ...data,
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
    hasMore,
  };
}

export async function fetchReceivingAccounts(): Promise<
  Array<{
    paymentMethod: string;
    accountNumber: string;
    accountName: string;
  }>
> {
  return apiFetch("/api/deposit/receiving-account");
}
