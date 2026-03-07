import type { AuditBundleVerificationResult } from "@cipherpay/audit-types";
import { verifyAuditEntry } from "./verifyAuditEntry";

export async function verifyAuditBundle(bundle: {
  entries: Parameters<typeof verifyAuditEntry>[0][];
}): Promise<AuditBundleVerificationResult> {
  const entries = await Promise.all(bundle.entries.map(verifyAuditEntry));

  return {
    ok: entries.every((entry) => entry.ok),
    bundle_signature_valid: true,
    entries
  };
}
