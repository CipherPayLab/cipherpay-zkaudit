export type AuditEventType = "transfer" | "withdraw" | "deposit";
export type DisclosureLevel =
  | "protocol_only"
  | "amount_only"
  | "recipient_only"
  | "full";

export interface AuditBundleEntry {
  entry_id: string;
  event_type: AuditEventType;
  nullifier?: string;
  onchain_receipt: {
    nullifier_record_pda?: string;
    tx_signature?: string;
    spent_slot?: number;
    spent_unix_ts?: number;
    merkle_root_before?: string;
    merkle_root_after?: string;
  };
  proof_artifacts: {
    verifier_key_id: string;
    groth16_proof: string;
    public_signals: string[] | Record<string, string>;
  };
  selective_disclosure: {
    level: DisclosureLevel;
    amount?: string;
    recipient?: string;
    memo?: string;
  };
  entry_integrity: {
    entry_hash_sha256: string;
  };
}
