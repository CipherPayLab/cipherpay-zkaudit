"use client";

import type { ActivityItem } from "@/types/activity";

interface AuditableActivityListProps {
  items: ActivityItem[];
  isSelected: (id: string) => boolean;
  onToggle: (id: string) => void;
}

function isAuditable(item: ActivityItem): boolean {
  return (
    (item.kind === "transfer" || item.kind === "withdraw") &&
    Boolean(item.proof_hex) &&
    Boolean(item.proof_public_signals) &&
    Boolean(item.verifier_key_id)
  );
}

export function AuditableActivityList({
  items,
  isSelected,
  onToggle
}: AuditableActivityListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-6 text-sm text-slate-600 shadow-sm">
        No activities found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-4 py-3">Select</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Counterparty</th>
            <th className="px-4 py-3">Created</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const auditable = isAuditable(item);

            return (
              <tr key={item.id} className="border-t">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isSelected(item.id)}
                    disabled={!auditable}
                    onChange={() => onToggle(item.id)}
                  />
                </td>
                <td className="px-4 py-3 font-medium capitalize">{item.kind}</td>
                <td className="px-4 py-3">
                  {item.amount} {item.token_symbol}
                </td>
                <td className="px-4 py-3">{item.counterparty ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">
                  {new Date(item.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  {auditable ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                      Auditable
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                      Not exportable
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
