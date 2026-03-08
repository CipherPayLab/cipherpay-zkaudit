import type {
  AuditBundleV1,
  AuditBundleSignature,
  UnsignedAuditBundleV1
} from "@cipherpay/audit-types";

export function finalizeSignedAuditBundle(input: {
  unsignedBundle: UnsignedAuditBundleV1;
  signerPubkey: string;
  signatureBase64: string;
}): AuditBundleV1 {
  const signature: AuditBundleSignature = {
    scheme: "ed25519",
    signer_pubkey: input.signerPubkey,
    signature_base64: input.signatureBase64
  };

  return {
    ...input.unsignedBundle,
    integrity: {
      ...input.unsignedBundle.integrity,
      signature
    }
  };
}
