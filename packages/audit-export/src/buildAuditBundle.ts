import type {
  AuditBundleEntry,
  AuditBundleHeader,
  AuditBundleV1,
  DisclosureLevel
} from "@cipherpay/audit-types";
import { hashBundle, hashEntry } from "@cipherpay/audit-bundle";
import { mapMessageToEntry, type ExportableMessage } from "./mapMessageToEntry";

export interface BuildAuditBundleInput {
  header: AuditBundleHeader;
  messages: ExportableMessage[];
  disclosureLevel?: DisclosureLevel;
  signerPubkey?: string;
  signatureBase64?: string;
}

export async function buildAuditBundle(
  input: BuildAuditBundleInput
): Promise<AuditBundleV1> {
  const disclosureLevel = input.disclosureLevel ?? "protocol_only";

  const entryPromises = input.messages.map(async (message) => {
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
  });

  const entries = await Promise.all(entryPromises);

  const bundleWithPlaceholderIntegrity: AuditBundleV1 = {
    schema: "cipherpay.audit_bundle.v1",
    header: input.header,
    entries,
    integrity: {
      bundle_hash_sha256: "",
      signature: {
        scheme: "ed25519",
        signer_pubkey: input.signerPubkey ?? "",
        signature_base64: input.signatureBase64 ?? ""
      }
    }
  };

  const bundleHash = await hashBundle(bundleWithPlaceholderIntegrity);

  return {
    ...bundleWithPlaceholderIntegrity,
    integrity: {
      ...bundleWithPlaceholderIntegrity.integrity,
      bundle_hash_sha256: bundleHash
    }
  };
}
