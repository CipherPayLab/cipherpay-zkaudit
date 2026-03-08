import type { AuditBundleEntry } from "./entry";

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

export interface AuditBundleSignature {
  scheme: "ed25519";
  signer_pubkey: string;
  signature_base64: string;
}

export interface AuditBundleIntegrityUnsigned {
  bundle_hash_sha256: string;
}

export interface AuditBundleIntegritySigned extends AuditBundleIntegrityUnsigned {
  signature: AuditBundleSignature;
}

export interface UnsignedAuditBundleV1 {
  schema: AuditBundleSchema;
  header: AuditBundleHeader;
  entries: AuditBundleEntry[];
  integrity: AuditBundleIntegrityUnsigned;
}

export interface AuditBundleV1 {
  schema: AuditBundleSchema;
  header: AuditBundleHeader;
  entries: AuditBundleEntry[];
  integrity: AuditBundleIntegritySigned;
}
