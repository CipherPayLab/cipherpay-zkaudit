export type AuditBundleSchema = "cipherpay.audit_bundle.v1";

export interface AuditBundleHeader {
  bundle_id: string;
  created_at_unix: number;
  created_at_iso: string;
  network: string;
  program_id: string;
  tree_account: string;
  verifier_key_id: string;
  owner: {
    wallet_pubkey: string;
    cipherpay_identity_commitment: string;
  };
  purpose: string;
  notes?: string;
}
