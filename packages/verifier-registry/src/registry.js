import { transferVerifierV1 } from "./transfer_v1";
import { withdrawVerifierV1 } from "./withdraw_v1";
export const verifierRegistry = {
    [transferVerifierV1.verifier_key_id]: transferVerifierV1,
    [withdrawVerifierV1.verifier_key_id]: withdrawVerifierV1
};
export function getVerifierDefinition(verifierKeyId) {
    return verifierRegistry[verifierKeyId] ?? null;
}
