"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { buildExportRequest } from "@/lib/user/buildExportRequest";
import type { ActivityItem, ActivitiesApiResponse } from "@/types/activity";
import { useSearchParams } from "next/navigation";

function UserExportContent() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") ?? "";

  const selectedIds = useMemo(
    () => idsParam.split(",").map((id) => id.trim()).filter(Boolean),
    [idsParam]
  );

  const [allItems, setAllItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bundleJson, setBundleJson] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/user/activities", {
          method: "GET",
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch activities: ${response.status}`);
        }

        const data = (await response.json()) as ActivitiesApiResponse;

        if (!cancelled) {
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
  }, []);

  const selectedItems = useMemo(
    () => allItems.filter((item) => selectedIds.includes(item.id)),
    [allItems, selectedIds]
  );

  async function handleExport() {
    try {
      setError(null);

      const requestBody = buildExportRequest({
        selectedItems
      });

      const response = await fetch("/api/user/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      const data = await response.json();
      setBundleJson(JSON.stringify(data.bundle, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  function handleDownload() {
    if (!bundleJson) return;

    const blob = new Blob([bundleJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "cipherpay-audit-bundle.json";
    anchor.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Export Audit Bundle</h1>
      <p className="mt-2 text-slate-600">
        Review the selected transactions and export a protocol-only audit bundle.
      </p>

      <div className="mt-6 space-y-4">
        {loading ? (
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
              <h2 className="text-lg font-semibold">Selected Items</h2>

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
                      <div className="font-medium capitalize">{item.kind}</div>
                      <div className="mt-1">
                        {item.amount} {item.token_symbol}
                      </div>
                      <div className="mt-1 text-slate-500">ID: {item.id}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Disclosure Level</h2>
              <p className="mt-2 text-sm text-slate-600">
                v1 uses <span className="font-medium">protocol_only</span>.
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={selectedItems.length === 0}
                  className={`rounded-lg px-4 py-2 text-sm text-white ${
                    selectedItems.length === 0
                      ? "bg-slate-300"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  Build Bundle
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!bundleJson}
                  className={`rounded-lg px-4 py-2 text-sm text-white ${
                    !bundleJson
                      ? "bg-slate-300"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  Download JSON
                </button>
              </div>
            </div>

            {bundleJson && (
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Generated Bundle</h2>
                <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
                  {bundleJson}
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
