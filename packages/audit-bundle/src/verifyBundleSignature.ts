import type { AuditBundleV1 } from "@cipherpay/audit-types";
import bs58 from "bs58";
import nacl from "tweetnacl";

function hexToBytes(hex: string): Uint8Array {
  const normalized = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (normalized.length % 2 !== 0) throw new Error("Invalid hex length");
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function base64ToBytes(base64: string): Uint8Array {
  return Uint8Array.from(Buffer.from(base64, "base64"));
}

export async function verifyBundleSignature(bundle: AuditBundleV1): Promise<boolean> {
  const signer = bundle.integrity.signature.signer_pubkey;
  const signatureBase64 = bundle.integrity.signature.signature_base64;
  const hashHex = bundle.integrity.bundle_hash_sha256;
  if (!signer || !signatureBase64 || !hashHex) return false;
  try {
    const publicKey = bs58.decode(signer);
    const signature = base64ToBytes(signatureBase64);
    const message = hexToBytes(hashHex);
    return nacl.sign.detached.verify(message, signature, publicKey);
  } catch {
    return false;
  }
}
