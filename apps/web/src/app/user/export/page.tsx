"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";

function truncate(str: string, head = 6, tail = 4) {
  if (str.length <= head + tail + 3) return str;
  return `${str.slice(0, head)}…${str.slice(-tail)}`;
}
import { useSearchParams } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import type {
  AuditBundleV1,
  UnsignedAuditBundleV1
} from "@cipherpay/audit-types";
import { finalizeSignedAuditBundle } from "@cipherpay/audit-export";
import { buildExportRequest } from "@/lib/user/buildExportRequest";
import { downloadBundle } from "@/lib/user/downloadBundle";
import { signBundleHash } from "@/lib/wallet/signBundleHash";
import type { ActivityItem, ActivitiesApiResponse } from "@/types/activity";

const LAMPORTS_PER_SOL = 1e9;

function formatAmount(amount: string, tokenSymbol: string): string {
  if (tokenSymbol !== "SOL") return `${amount} ${tokenSymbol}`;
  const lamports = Number(amount);
  if (Number.isNaN(lamports)) return `${amount} ${tokenSymbol}`;
  const sol = lamports / LAMPORTS_PER_SOL;
  return `${sol % 1 === 0 ? sol : sol.toFixed(4)} ${tokenSymbol}`;
}

function UserExportContent() {
  const searchParams = useSearchParams();
  const wallet = useWallet();
  const idsParam = searchParams.get("ids") ?? "";

  const selectedIds = useMemo(
    () => idsParam.split(",").map((id) => id.trim()).filter(Boolean),
    [idsParam]
  );

  const [allItems, setAllItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [unsignedBundle, setUnsignedBundle] = useState<UnsignedAuditBundleV1 | null>(null);
  const [signedBundle, setSignedBundle] = useState<AuditBundleV1 | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const currentUser = useCurrentUser();

  function refresh() {
    setRefreshKey((k) => k + 1);
    setUnsignedBundle(null);
    setSignedBundle(null);
    setError(null);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        setUnauthorized(false);

        const response = await fetch("/api/user/activities", {
          method: "GET",
          cache: "no-store",
          credentials: "include"
        });

        const data = (await response.json()) as
          | ActivitiesApiResponse
          | { ok: false; error?: string };

        if (response.status === 401) {
          if (!cancelled) {
            setUnauthorized(true);
            setAllItems([]);
          }
          return;
        }

        if (!response.ok) {
          throw new Error(data && "error" in data ? data.error ?? "Failed to fetch activities" : `Failed to fetch activities: ${response.status}`);
        }

        if (!cancelled && "items" in data) {
          setAllItems(data.items);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const selectedItems = useMemo(
    () => allItems.filter((item) => selectedIds.includes(item.id)),
    [allItems, selectedIds]
  );

  async function handleBuildUnsignedBundle() {
    try {
      if (!wallet.connected || !wallet.publicKey) {
        throw new Error("Connect a wallet before building the audit bundle");
      }

      setBusy(true);
      setError(null);
      setSignedBundle(null);

      const requestBody = buildExportRequest({
        ownerWalletPubkey: wallet.publicKey.toBase58(),
        selectedIds
      });

      const response = await fetch("/api/user/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.status === 401) {
        setUnauthorized(true);
        throw new Error("Please sign in to CipherPay first");
      }

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? `Export failed: ${response.status}`);
      }

      setUnsignedBundle(data.unsignedBundle as UnsignedAuditBundleV1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignBundle() {
    try {
      if (!unsignedBundle) {
        throw new Error("No unsigned bundle available");
      }

      setBusy(true);
      setError(null);

      const signResult = await signBundleHash({
        wallet,
        bundleHashHex: unsignedBundle.integrity.bundle_hash_sha256
      });

      const finalized = finalizeSignedAuditBundle({
        unsignedBundle,
        signerPubkey: signResult.signerPubkey,
        signatureBase64: signResult.signatureBase64
      });

      setSignedBundle(finalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBusy(false);
    }
  }

  function handleDownload() {
    if (!signedBundle) return;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    downloadBundle(`cipherpay-audit-bundle-${timestamp}.json`, signedBundle);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Export Audit Bundle</h1>
          <p className="mt-2 text-slate-600">
            Review selected transactions, build an unsigned bundle, sign its hash,
            and download the final audit file.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/user/activities"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            ← Home
          </Link>
          {mounted && currentUser ? (
            <div className="shrink-0 rounded-xl border bg-white px-4 py-3 shadow-sm text-sm">
              <div className="font-medium text-slate-900">
                {currentUser.username ?? "Unknown User"}
              </div>
              {currentUser.solana_wallet_address && (
                <div
                  className="mt-1 font-mono text-xs text-slate-500 cursor-pointer"
                  title={currentUser.solana_wallet_address}
                  onClick={() =>
                    navigator.clipboard.writeText(currentUser.solana_wallet_address!)
                  }
                >
                  {truncate(currentUser.solana_wallet_address, 8, 6)}
                </div>
              )}
              <div
                className="mt-1 font-mono text-xs text-slate-400 cursor-pointer"
                title={currentUser.owner_cipherpay_pub_key}
                onClick={() =>
                  navigator.clipboard.writeText(currentUser.owner_cipherpay_pub_key)
                }
              >
                CP: {truncate(currentUser.owner_cipherpay_pub_key, 8, 6)}
              </div>
            </div>
          ) : mounted ? (
            <WalletMultiButton />
          ) : null}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {unauthorized ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-amber-900">
              Sign in to CipherPay first
            </h2>
            <p className="mt-2 text-sm text-amber-800">
              Your CipherPay session is missing or expired. Sign in through CipherPay,
              then come back here to export your audit bundle.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={process.env.NEXT_PUBLIC_CIPHERPAY_APP_URL ?? "https://cp.appfounder.ca"}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700"
              >
                Open CipherPay
              </a>

              <Link
                href="/user/activities"
                className="rounded-lg border border-amber-300 px-4 py-2 text-sm text-amber-900"
              >
                Back to Activities
              </Link>
            </div>
          </div>
        ) : loading ? (
          <div className="rounded-xl border bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading selected activities...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        ) : (
          <>
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Selected Items</h2>
                <button
                  type="button"
                  onClick={refresh}
                  disabled={loading || busy}
                  className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  >
                    <path
                      fillRule="evenodd"
                      d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0v2.43l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Refresh
                </button>
              </div>

              {selectedItems.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">
                  No selected items found. Go back and select transactions first.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {selectedItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border p-4 text-sm text-slate-700"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold capitalize">{item.kind}</span>
                        <span className="text-base font-bold text-slate-900">
                          {formatAmount(item.amount, item.token_symbol)}
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                        <span className="text-slate-400">Sender</span>
                        <span className="font-medium text-slate-700">
                          {item.sender_name
                            ? item.sender_name
                            : item.sender_key
                              ? truncate(item.sender_key, 8, 6)
                              : "—"}
                        </span>

                        <span className="text-slate-400">Recipient</span>
                        <span className="font-medium text-slate-700">
                          {item.recipient_name
                            ? item.recipient_name
                            : item.recipient_key
                              ? truncate(item.recipient_key, 8, 6)
                              : "—"}
                        </span>

                        <span className="text-slate-400">Time</span>
                        <span className="text-slate-600">
                          {new Date(item.created_at).toLocaleString()}
                        </span>

                        <span className="text-slate-400">ID</span>
                        <span className="font-mono text-slate-500">{item.id}</span>

                        {item.nullifier_record_pda && (
                          <>
                            <span className="text-slate-400">PDA</span>
                            <span
                              className="font-mono text-slate-400 cursor-pointer"
                              title={item.nullifier_record_pda}
                              onClick={() =>
                                navigator.clipboard.writeText(item.nullifier_record_pda!)
                              }
                            >
                              {truncate(item.nullifier_record_pda, 8, 6)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Export Flow</h2>
              <p className="mt-2 text-sm text-slate-600">
                v1 uses <span className="font-medium">protocol_only</span>.
              </p>

              <div className="mt-2 text-sm text-slate-600">
                Connected wallet:{" "}
                <span className="font-mono">
                  {wallet.publicKey?.toBase58() ?? "Not connected"}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleBuildUnsignedBundle}
                  disabled={selectedItems.length === 0 || !wallet.connected || busy}
                  className={`rounded-lg px-4 py-2 text-sm text-white ${
                    selectedItems.length === 0 || !wallet.connected || busy
                      ? "bg-slate-300"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  Build Unsigned Bundle
                </button>

                <button
                  type="button"
                  onClick={handleSignBundle}
                  disabled={!unsignedBundle || !wallet.connected || busy}
                  className={`rounded-lg px-4 py-2 text-sm text-white ${
                    !unsignedBundle || !wallet.connected || busy
                      ? "bg-slate-300"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  Sign Bundle Hash
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!signedBundle || busy}
                  className={`rounded-lg px-4 py-2 text-sm text-white ${
                    !signedBundle || busy
                      ? "bg-slate-300"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  Download Signed JSON
                </button>
              </div>

              {!wallet.connected ? (
                <p className="mt-4 text-sm text-amber-700">
                  Connect a wallet to build and sign the bundle.
                </p>
              ) : null}
            </div>

            {unsignedBundle && (
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Unsigned Bundle</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Header owner wallet:{" "}
                  <span className="font-mono text-xs">
                    {unsignedBundle.header.owner.wallet_pubkey}
                  </span>
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Bundle hash:{" "}
                  <span className="font-mono text-xs">
                    {unsignedBundle.integrity.bundle_hash_sha256}
                  </span>
                </p>

                <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
                  {JSON.stringify(unsignedBundle, null, 2)}
                </pre>
              </div>
            )}

            {signedBundle && (
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Signed Bundle</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Signature signer:{" "}
                  <span className="font-mono text-xs">
                    {signedBundle.integrity.signature.signer_pubkey}
                  </span>
                </p>

                <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
                  {JSON.stringify(signedBundle, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function UserExportPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-5xl px-6 py-10">
          <h1 className="text-2xl font-semibold">Export Audit Bundle</h1>
          <p className="mt-2 text-slate-600">Loading...</p>
        </main>
      }
    >
      <UserExportContent />
    </Suspense>
  );
}
