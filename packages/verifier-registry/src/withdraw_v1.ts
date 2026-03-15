import type { VerifierDefinition } from "./types";

export const withdrawVerifierV1: VerifierDefinition = {
  verifier_key_id: "groth16_withdraw_bn254_v1",
  event_type: "withdraw",
  proof_format: "groth16_bn254",
  // Circom 2 signal order: outputs (declaration order) then public inputs (component main order)
  // Outputs: nullifier, merkleRoot
  // Public inputs: recipientOwner_lo, recipientOwner_hi, recipientWalletPubKey, amount, tokenId
  public_signal_order: [
    "nullifier",
    "old_root",
    "recipient_owner_lo",
    "recipient_owner_hi",
    "recipient_wallet_pub_key",
    "amount",
    "token_id"
  ]
};
