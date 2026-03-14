"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ActivityFilterBar } from "@/components/user/ActivityFilterBar";
import { AuditableActivityList } from "@/components/user/AuditableActivityList";
import { SelectionToolbar } from "@/components/user/SelectionToolbar";
import { useActivities } from "@/hooks/useActivities";
import { useSelection } from "@/hooks/useSelection";
import type { ActivityKind } from "@/types/activity";

export default function UserActivitiesPage() {
  const [kind, setKind] = useState<ActivityKind | "all">("all");
  const [search, setSearch] = useState("");

  const { items, loading, error, unauthorized, refresh } = useActivities({ kind, search });
  const { selectedIds, isSelected, toggle, clear } = useSelection(items);

  const exportHref = useMemo(() => {
    const params = new URLSearchParams();

    if (selectedIds.length > 0) {
      params.set("ids", selectedIds.join(","));
    }

    return `/user/export?${params.toString()}`;
  }, [selectedIds]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Select Auditable Transactions</h1>
      <p className="mt-2 text-slate-600">
        Choose transfer and withdraw transactions to include in an audit bundle.
      </p>

      <div className="mt-6 space-y-4">
        {unauthorized ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-amber-900">
              Sign in to CipherPay first
            </h2>
            <p className="mt-2 text-sm text-amber-800">
              We could not find a valid CipherPay session for this browser. Please sign
              in through CipherPay first, then return to the audit portal.
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
                Retry
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ActivityFilterBar
              kind={kind}
              search={search}
              onKindChange={setKind}
              onSearchChange={setSearch}
            />

            <SelectionToolbar
              selectedCount={selectedIds.length}
              exportHref={exportHref}
              onClear={clear}
              onRefresh={refresh}
              refreshing={loading}
            />

            {loading ? (
              <div className="rounded-xl border bg-white p-6 text-sm text-slate-600 shadow-sm">
                Loading activities...
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">
                {error}
              </div>
            ) : (
              <AuditableActivityList
                items={items}
                isSelected={isSelected}
                onToggle={toggle}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}
