import type { AuditBundleV1 } from "@cipherpay/audit-types";

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function validateBundleSchema(bundle: unknown): AuditBundleV1 {
  if (!isObject(bundle)) {
    throw new Error("Bundle must be an object");
  }
  if (bundle.schema !== "cipherpay.audit_bundle.v1") {
    throw new Error("Unsupported or missing bundle schema");
  }
  if (!isObject(bundle.header)) {
    throw new Error("Missing header");
  }
  if (!Array.isArray(bundle.entries)) {
    throw new Error("Missing entries array");
  }
  if (!isObject(bundle.integrity)) {
    throw new Error("Missing integrity object");
  }
  if (typeof bundle.integrity.bundle_hash_sha256 !== "string") {
    throw new Error("Missing bundle_hash_sha256");
  }
  if (!isObject(bundle.integrity.signature)) {
    throw new Error("Missing signature object");
  }
  if (bundle.integrity.signature.scheme !== "ed25519") {
    throw new Error("Unsupported signature scheme");
  }
  if (typeof bundle.integrity.signature.signer_pubkey !== "string") {
    throw new Error("Missing signer_pubkey");
  }
  if (typeof bundle.integrity.signature.signature_base64 !== "string") {
    throw new Error("Missing signature_base64");
  }
  return bundle as unknown as AuditBundleV1;
}
