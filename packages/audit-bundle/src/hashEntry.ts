import type { AuditBundleEntry } from "@cipherpay/audit-types";
import { canonicalizeJson } from "./canonicalizeJson";
import { sha256Hex } from "./sha256";

export async function hashEntry(
  entry: Omit<AuditBundleEntry, "entry_integrity">
): Promise<string> {
  const canonical = canonicalizeJson(entry);
  return sha256Hex(canonical);
}
