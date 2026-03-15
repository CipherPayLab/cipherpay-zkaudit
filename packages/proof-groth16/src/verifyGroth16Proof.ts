import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { Groth16 } from "snarkjs";
import { groth16 } from "snarkjs";
import { getVerifierDefinition } from "@cipherpay/verifier-registry";

interface Groth16ProofJson {
  pi_a: unknown;
  pi_b: unknown;
  pi_c: unknown;
  protocol?: string;
  curve?: string;
}

// Map verifier_key_id → bundled vkey file name (co-located with this source file)
const VKEY_FILE_MAP: Record<string, string> = {
  "groth16_bn254_v1": "transfer_vkey.json",
  "groth16_transfer_bn254_v1": "transfer_vkey.json",
  "groth16_withdraw_bn254_v1": "withdraw_vkey.json",
  "groth16_deposit_bn254_v1": "deposit_vkey.json",
};

async function loadBundledVkey(verifierKeyId: string): Promise<unknown> {
  const fileName = VKEY_FILE_MAP[verifierKeyId];
  if (!fileName) {
    throw new Error(`No bundled vkey for verifier_key_id: ${verifierKeyId}`);
  }
  // Resolve relative to this file at runtime (works both from src/ and dist/)
  const __dir = dirname(fileURLToPath(import.meta.url));
  const vkeyPath = join(__dir, "zk", "circuits", fileName);
  const raw = await fs.readFile(vkeyPath, "utf8");
  return JSON.parse(raw) as unknown;
}

/**
 * Decode a 512-char compact hex proof (from groth16ProofToHex) back into snarkjs JSON format.
 * Layout: [pi_a[0], pi_a[1], pi_b[0][0], pi_b[0][1], pi_b[1][0], pi_b[1][1], pi_c[0], pi_c[1]]
 * Each field element is a big-endian 32-byte integer stored as hex.
 */
function hexToGroth16ProofJson(hex: string): Groth16ProofJson {
  if (hex.length !== 512 || !/^[0-9a-f]+$/i.test(hex)) {
    throw new Error("Unsupported proof encoding — expected JSON-serialized Groth16 proof (snarkjs format).");
  }
  const fields: string[] = [];
  for (let i = 0; i < 8; i++) {
    const chunk = hex.slice(i * 64, i * 64 + 64);
    fields.push(BigInt("0x" + chunk).toString(10));
  }
  return {
    pi_a: [fields[0], fields[1], "1"],
    pi_b: [[fields[2], fields[3]], [fields[4], fields[5]], ["1", "0"]],
    pi_c: [fields[6], fields[7], "1"],
    protocol: "groth16",
    curve: "bn128",
  };
}

function parseProof(proof: string): Groth16ProofJson {
  const trimmed = proof.trim();
  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed) as Groth16ProofJson;
  }
  // Backward-compat: handle old compact hex format (512-char hex from groth16ProofToHex)
  if (trimmed.length === 512) {
    return hexToGroth16ProofJson(trimmed);
  }
  throw new Error(
    "Unsupported proof encoding — expected JSON-serialized Groth16 proof (snarkjs format)."
  );
}

export async function verifyGroth16Proof(input: {
  proof: string;
  publicSignals: string[] | Record<string, string>;
  verifierKeyId: string;
}): Promise<boolean> {
  const verifier = getVerifierDefinition(input.verifierKeyId);

  if (!verifier) {
    throw new Error(`Unknown verifier_key_id: ${input.verifierKeyId}`);
  }

  const vkey = await loadBundledVkey(input.verifierKeyId);
  const proofJson = parseProof(input.proof);

  const publicSignalsArray = Array.isArray(input.publicSignals)
    ? input.publicSignals.map(String)
    : verifier.public_signal_order.map((name) => String((input.publicSignals as Record<string, string>)[name]));

  return groth16.verify(vkey as Parameters<Groth16["verify"]>[0], publicSignalsArray, proofJson);
}
