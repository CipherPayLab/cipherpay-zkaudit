import type { AuditBundleEntry, AuditBundleHeader } from "@cipherpay/audit-types";
import { mapMessageToEntry } from "./mapMessageToEntry";

export function buildAuditBundle(input: {
  header: AuditBundleHeader;
  messages: Array<Parameters<typeof mapMessageToEntry>[0]>;
}) {
  const entries: AuditBundleEntry[] = input.messages.map(mapMessageToEntry);

  return {
    schema: "cipherpay.audit_bundle.v1",
    header: input.header,
    entries,
    integrity: {
      bundle_hash_sha256: "",
      signature: {
        scheme: "ed25519",
        signer_pubkey: "",
        signature_base64: ""
      }
    }
  };
}
