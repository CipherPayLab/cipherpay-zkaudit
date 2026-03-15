import type { VerifierDefinition } from "./types";

export const transferVerifierV1: VerifierDefinition = {
  verifier_key_id: "groth16_bn254_v1",
  event_type: "transfer",
  proof_format: "groth16_bn254",
  // Circom 2 signal order: outputs (declaration order) then public inputs (component main order)
  // Outputs: outCommitment1, outCommitment2, nullifier, merkleRoot, newMerkleRoot1, newMerkleRoot2, newNextLeafIndex
  // Public inputs: encNote1Hash, encNote2Hash
  public_signal_order: [
    "out1_commitment",
    "out2_commitment",
    "nullifier",
    "old_root",
    "new_root1",
    "new_root2",
    "new_next_leaf_index",
    "enc_note1_hash",
    "enc_note2_hash"
  ]
};
