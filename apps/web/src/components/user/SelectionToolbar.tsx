"use client";

import Link from "next/link";

interface SelectionToolbarProps {
  selectedCount: number;
  exportHref: string;
  onClear: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function SelectionToolbar({
  selectedCount,
  exportHref,
  onClear,
  onRefresh,
  refreshing = false
}: SelectionToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-slate-700">
        <span className="font-semibold">{selectedCount}</span> item(s) selected
      </div>

      <div className="flex gap-2">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            >
              <path
                fillRule="evenodd"
                d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0v2.43l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z"
                clipRule="evenodd"
              />
            </svg>
            Refresh
          </button>
        )}

        <button
          type="button"
          onClick={onClear}
          className="rounded-lg border px-4 py-2 text-sm"
        >
          Clear
        </button>

        <Link
          href={exportHref}
          className={`rounded-lg px-4 py-2 text-sm text-white ${
            selectedCount === 0
              ? "pointer-events-none bg-slate-300"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          Review Export
        </Link>
      </div>
    </div>
  );
}
