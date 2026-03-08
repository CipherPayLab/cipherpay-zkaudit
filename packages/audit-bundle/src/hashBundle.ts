import type { UnsignedAuditBundleV1 } from "@cipherpay/audit-types";
import { canonicalizeJson } from "./canonicalizeJson";
import { sha256Hex } from "./sha256";

export async function hashBundle(
  bundle: Omit<UnsignedAuditBundleV1, "integrity"> & {
    integrity: {
      bundle_hash_sha256: string;
    };
  }
): Promise<string> {
  const canonical = canonicalizeJson(bundle);
  return sha256Hex(canonical);
}
