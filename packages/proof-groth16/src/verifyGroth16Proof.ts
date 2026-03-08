import fs from "node:fs/promises";
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

function parseProof(proof: string): Groth16ProofJson {
  const trimmed = proof.trim();
  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed) as Groth16ProofJson;
  }
  throw new Error(
    "Unsupported proof encoding. Expected JSON-serialized Groth16 proof for v1."
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

  if (!verifier.verifying_key_path) {
    throw new Error(`Missing verifying key path for ${input.verifierKeyId}`);
  }

  const vkeyRaw = await fs.readFile(verifier.verifying_key_path, "utf8");
  const vkey = JSON.parse(vkeyRaw) as Parameters<Groth16["verify"]>[0];
  const proofJson = parseProof(input.proof);

  const publicSignalsArray = Array.isArray(input.publicSignals)
    ? input.publicSignals.map(String)
    : verifier.public_signal_order.map((name) => String((input.publicSignals as Record<string, string>)[name]));

  return groth16.verify(vkey, publicSignalsArray, proofJson);
}
