import type {
  AuditBundleV1,
  AuditBundleVerificationResult
} from "@cipherpay/audit-types";
import { validateBundleSchema, verifyBundleSignature } from "@cipherpay/audit-bundle";
import { verifyAuditEntry } from "./verifyAuditEntry";

export async function verifyAuditBundle(
  rawBundle: unknown
): Promise<AuditBundleVerificationResult> {
  const bundle = validateBundleSchema(rawBundle) as AuditBundleV1;

  const bundleErrors: string[] = [];
  const bundleWarnings: string[] = [];

  const bundleSignatureValid = await verifyBundleSignature(bundle);

  if (!bundleSignatureValid) {
    bundleErrors.push("Bundle signature is invalid");
  }

  const ownerWallet = bundle.header.owner.wallet_pubkey;
  const signerWallet = bundle.integrity.signature.signer_pubkey;

  if (!ownerWallet) {
    bundleErrors.push("Bundle header missing owner.wallet_pubkey");
  }

  if (!signerWallet) {
    bundleErrors.push("Bundle signature missing signer_pubkey");
  }

  if (ownerWallet && signerWallet && ownerWallet !== signerWallet) {
    bundleErrors.push(
      "Bundle owner wallet does not match signature signer wallet"
    );
  }

  const entries = await Promise.all(bundle.entries.map(verifyAuditEntry));

  const ok =
    bundleErrors.length === 0 &&
    bundleSignatureValid &&
    entries.every((entry) => entry.ok);

  return {
    ok,
    bundle_signature_valid: bundleSignatureValid,
    bundle_errors: bundleErrors,
    bundle_warnings: bundleWarnings,
    entries
  };
}
