import { transferVerifierV1 } from "./transfer_v1";
import { withdrawVerifierV1 } from "./withdraw_v1";
import type { VerifierDefinition } from "./types";

export const verifierRegistry: Record<string, VerifierDefinition> = {
  [transferVerifierV1.verifier_key_id]: transferVerifierV1,
  [withdrawVerifierV1.verifier_key_id]: withdrawVerifierV1
};

export function getVerifierDefinition(verifierKeyId: string): VerifierDefinition | null {
  return verifierRegistry[verifierKeyId] ?? null;
}
