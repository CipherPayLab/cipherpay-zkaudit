import { transferVerifierV1 } from "./transfer_v1";

export const verifierRegistry = {
  [transferVerifierV1.verifier_key_id]: transferVerifierV1
};

export function getVerifierDefinition(verifierKeyId: string) {
  return verifierRegistry[verifierKeyId as keyof typeof verifierRegistry] ?? null;
}
