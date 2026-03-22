"use client";

/** sessionStorage key for JWT passed via URL hash from CipherPay (see Dashboard link). */
const STORAGE_KEY = "cipherpay_bearer_token";

/** Read #cp_token=<jwt> from hash (fragment is not sent to the server). */
export function consumeCipherPayTokenFromHash(): void {
  if (typeof window === "undefined") return;
  const hash = window.location.hash;
  if (!hash || hash.length < 2) return;
  const m = hash.match(/^#cp_token=(.+)$/);
  if (!m) return;
  const token = decodeURIComponent(m[1].trim());
  if (!token) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, token);
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    );
  } catch {
    /* ignore */
  }
}

export function getCipherpayAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const t = sessionStorage.getItem(STORAGE_KEY);
    if (t) return { Authorization: `Bearer ${t}` };
  } catch {
    /* ignore */
  }
  return {};
}

export function mergeCipherpayFetchInit(init?: RequestInit): RequestInit {
  const extra = getCipherpayAuthHeaders();
  const headers = new Headers(init?.headers);
  if (extra.Authorization) headers.set("Authorization", extra.Authorization);
  return {
    ...init,
    credentials: init?.credentials ?? "include",
    headers
  };
}
