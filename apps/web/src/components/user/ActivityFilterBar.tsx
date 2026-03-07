"use client";

import type { ActivityKind } from "@/types/activity";

interface ActivityFilterBarProps {
  kind: ActivityKind | "all";
  search: string;
  onKindChange: (value: ActivityKind | "all") => void;
  onSearchChange: (value: string) => void;
}

export function ActivityFilterBar({
  kind,
  search,
  onKindChange,
  onSearchChange
}: ActivityFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-2">
        <label htmlFor="kind" className="text-sm font-medium text-slate-700">
          Type
        </label>
        <select
          id="kind"
          value={kind}
          onChange={(e) => onKindChange(e.target.value as ActivityKind | "all")}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="transfer">Transfer</option>
          <option value="withdraw">Withdraw</option>
          <option value="deposit">Deposit</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="search" className="text-sm font-medium text-slate-700">
          Search
        </label>
        <input
          id="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tx, amount, counterparty..."
          className="w-full rounded-lg border px-3 py-2 text-sm md:w-80"
        />
      </div>
    </div>
  );
}
