import type { AuditBundle } from "@cipherpay-zkaudit/audit-types";

export function buildAuditBundle(_activities: unknown[]): AuditBundle {
  return { header: { version: "1" }, entries: [] };
}
