import type { AuditBundleEntry } from "@cipherpay/audit-types";

export function mapMessageToEntry(message: {
  id: string;
  kind: string;
  nullifier_hex?: string | null;
  proof_hex?: string | null;
  proof_public_signals?: string | null;
  verifier_key_id?: string | null;
  tx_signature?: string | null;
  amount?: string | null;
}): AuditBundleEntry {
  return {
    entry_id: message.id,
    event_type: message.kind as AuditBundleEntry["event_type"],
    nullifier: message.nullifier_hex ?? undefined,
    onchain_receipt: {
      tx_signature: message.tx_signature ?? undefined
    },
    proof_artifacts: {
      verifier_key_id: message.verifier_key_id ?? "groth16_bn254_v1",
      groth16_proof: message.proof_hex ?? "",
      public_signals: message.proof_public_signals
        ? JSON.parse(message.proof_public_signals)
        : []
    },
    selective_disclosure: {
      level: "protocol_only",
      amount: message.amount ?? undefined
    },
    entry_integrity: {
      entry_hash_sha256: ""
    }
  };
}
