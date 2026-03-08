import { getVerifierDefinition } from "@cipherpay/verifier-registry";

export type DecodedPublicSignals = Record<string, string>;

export function decodePublicSignals(input: {
  verifierKeyId: string;
  publicSignals: string[] | Record<string, string>;
}): DecodedPublicSignals {
  const verifier = getVerifierDefinition(input.verifierKeyId);
  if (!verifier) throw new Error(`Unknown verifier_key_id: ${input.verifierKeyId}`);

  if (Array.isArray(input.publicSignals)) {
    const arr = input.publicSignals;
    if (arr.length !== verifier.public_signal_order.length) {
      throw new Error(
        `Public signal length mismatch for ${input.verifierKeyId}: expected ${verifier.public_signal_order.length}, got ${arr.length}`
      );
    }
    return Object.fromEntries(
      verifier.public_signal_order.map((name, index) => [name, String(arr[index])])
    );
  }

  const named = input.publicSignals as Record<string, string>;
  const missing = verifier.public_signal_order.filter((name) => !(name in named));
  if (missing.length > 0) {
    throw new Error(`Missing named public signals for ${input.verifierKeyId}: ${missing.join(", ")}`);
  }
  return Object.fromEntries(
    verifier.public_signal_order.map((name) => [name, String(named[name])])
  );
}
