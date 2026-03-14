import type { WalletContextState } from "@solana/wallet-adapter-react";

export interface WalletSignResult {
  signerPubkey: string;
  signatureBase64: string;
}

function hexToBytes(hex: string): Uint8Array {
  const normalized = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (normalized.length % 2 !== 0) {
    throw new Error("Invalid bundle hash hex length");
  }
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof window === "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return window.btoa(binary);
}

export async function signBundleHash(input: {
  wallet: WalletContextState;
  bundleHashHex: string;
}): Promise<WalletSignResult> {
  const { wallet, bundleHashHex } = input;
  if (!wallet.connected || !wallet.publicKey) {
    throw new Error("Wallet not connected");
  }
  if (!wallet.signMessage) {
    throw new Error("Connected wallet does not support message signing");
  }

  // Sign the UTF-8 bytes of the hex string (e.g. "a3f2...") rather than the
  // raw 32-byte hash. Raw bytes can trigger Phantom's transaction-detection
  // check ("You cannot sign solana transactions using sign message").
  // The verifier (verifyBundleSignature.ts) encodes the hash the same way.
  const messageBytes = new TextEncoder().encode(bundleHashHex);
  const signatureBytes = await wallet.signMessage(messageBytes);
  return {
    signerPubkey: wallet.publicKey.toBase58(),
    signatureBase64: bytesToBase64(signatureBytes)
  };
}
