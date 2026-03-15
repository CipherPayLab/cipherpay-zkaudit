import type { VerifierDefinition } from "./types";

export const depositVerifierV1: VerifierDefinition = {
  verifier_key_id: "groth16_deposit_bn254_v1",
  event_type: "deposit",
  proof_format: "groth16_bn254",
  // Circom 2 signal order: outputs (declaration order) then public inputs (component main order)
  // Outputs: newCommitment, ownerCipherPayPubKey, newMerkleRoot, newNextLeafIndex
  // Public inputs: amount, depositHash, oldMerkleRoot
  public_signal_order: [
    "new_commitment",
    "owner_cipherpay_pub_key",
    "new_merkle_root",
    "new_next_leaf_index",
    "amount",
    "deposit_hash",
    "old_merkle_root"
  ]
};
