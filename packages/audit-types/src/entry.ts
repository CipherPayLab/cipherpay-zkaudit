export interface AuditEntry {
  id: string;
  kind: string;
  proof_hex?: string;
  proof_public_signals?: string[];
  verifier_key_id?: string;
}
