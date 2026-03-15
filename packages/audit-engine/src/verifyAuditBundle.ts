import type {
  AuditBundleV1,
  AuditBundleVerificationResult
} from "@cipherpay/audit-types";
import { validateBundleSchema, verifyBundleSignature } from "@cipherpay/audit-bundle";
import { verifyAuditEntry } from "./verifyAuditEntry";

export async function verifyAuditBundle(
  rawBundle: unknown
): Promise<AuditBundleVerificationResult> {
  console.log("[verifyAuditBundle] Starting bundle verification…");
  const t0 = Date.now();

  const bundle = validateBundleSchema(rawBundle) as AuditBundleV1;

  const bundleErrors: string[] = [];
  const bundleWarnings: string[] = [];

  // ── Step 1: Verify bundle signature ──
  console.log("[verifyAuditBundle] Step 1: verifying bundle signature…");
  const bundleSignatureValid = await verifyBundleSignature(bundle);
  console.log(`[verifyAuditBundle] Step 1 done — bundleSignatureValid=${bundleSignatureValid}`);

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

  // ── Step 2: Verify each entry ──
  console.log(`[verifyAuditBundle] Step 2: verifying ${bundle.entries.length} entries…`);
  const entries = await Promise.all(bundle.entries.map(verifyAuditEntry));

  const ok =
    bundleErrors.length === 0 &&
    bundleSignatureValid &&
    entries.every((entry) => entry.ok);

  const elapsed = Date.now() - t0;
  console.log(`[verifyAuditBundle] Done in ${elapsed}ms — ok=${ok} bundleErrors=[${bundleErrors.join("; ")}]`);

  return {
    ok,
    bundle_signature_valid: bundleSignatureValid,
    bundle_errors: bundleErrors,
    bundle_warnings: bundleWarnings,
    entries
  };
}
