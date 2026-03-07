"use client";

import { useMemo, useState } from "react";
import { ActivityFilterBar } from "@/components/user/ActivityFilterBar";
import { AuditableActivityList } from "@/components/user/AuditableActivityList";
import { SelectionToolbar } from "@/components/user/SelectionToolbar";
import { useActivities } from "@/hooks/useActivities";
import { useSelection } from "@/hooks/useSelection";
import type { ActivityKind } from "@/types/activity";

export default function UserActivitiesPage() {
  const [kind, setKind] = useState<ActivityKind | "all">("all");
  const [search, setSearch] = useState("");

  const { items, loading, error } = useActivities({ kind, search });
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
      </div>
    </main>
  );
}
