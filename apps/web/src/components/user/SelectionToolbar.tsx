"use client";

import Link from "next/link";

interface SelectionToolbarProps {
  selectedCount: number;
  exportHref: string;
  onClear: () => void;
}

export function SelectionToolbar({
  selectedCount,
  exportHref,
  onClear
}: SelectionToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-slate-700">
        <span className="font-semibold">{selectedCount}</span> item(s) selected
      </div>

      <div className="flex gap-2">
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
