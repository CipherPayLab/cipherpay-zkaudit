import type {
  AuditBundleEntry,
  AuditBundleHeader,
  DisclosureLevel,
  UnsignedAuditBundleV1
} from "@cipherpay/audit-types";
import { hashBundle, hashEntry } from "@cipherpay/audit-bundle";
import { mapMessageToEntry, type ExportableMessage } from "./mapMessageToEntry";

export interface BuildUnsignedAuditBundleInput {
  header: AuditBundleHeader;
  messages: ExportableMessage[];
  disclosureLevel?: DisclosureLevel;
}

export async function buildUnsignedAuditBundle(
  input: BuildUnsignedAuditBundleInput
): Promise<UnsignedAuditBundleV1> {
  const disclosureLevel = input.disclosureLevel ?? "protocol_only";

  const entries = await Promise.all(
    input.messages.map(async (message) => {
      const baseEntry = mapMessageToEntry(message, disclosureLevel);

      const entryWithoutIntegrity: Omit<AuditBundleEntry, "entry_integrity"> = {
        entry_id: baseEntry.entry_id,
        event_type: baseEntry.event_type,
        nullifier: baseEntry.nullifier,
        onchain_receipt: baseEntry.onchain_receipt,
        proof_artifacts: baseEntry.proof_artifacts,
        selective_disclosure: baseEntry.selective_disclosure
      };

      const entryHash = await hashEntry(entryWithoutIntegrity);

      return {
        ...baseEntry,
        entry_integrity: {
          entry_hash_sha256: entryHash
        }
      };
    })
  );

  const unsignedBundle: UnsignedAuditBundleV1 = {
    schema: "cipherpay.audit_bundle.v1",
    header: input.header,
    entries,
    integrity: {
      bundle_hash_sha256: ""
    }
  };

  const bundleHash = await hashBundle(unsignedBundle);

  return {
    ...unsignedBundle,
    integrity: {
      bundle_hash_sha256: bundleHash
    }
  };
}
