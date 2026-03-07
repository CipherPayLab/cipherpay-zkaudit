export interface AuditEntryVerificationResult {
  entry_id: string;
  ok: boolean;
  proof_valid: boolean;
  signature_valid?: boolean;
  receipt_match: boolean;
  errors: string[];
  warnings: string[];
}

export interface AuditBundleVerificationResult {
  ok: boolean;
  bundle_signature_valid: boolean;
  entries: AuditEntryVerificationResult[];
}
