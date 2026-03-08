export const transferVerifierV1 = {
    verifier_key_id: "groth16_bn254_v1",
    event_type: "transfer",
    proof_format: "groth16_bn254",
    public_signal_order: [
        "nullifier",
        "old_root",
        "new_root1",
        "new_root2",
        "out1_commitment",
        "out2_commitment",
        "ownerCipherPayPubKey",
        "new_next_leaf_index"
    ],
    verifying_key_path: typeof process !== "undefined" ? process.env?.CIPHERPAY_TRANSFER_VKEY_PATH : undefined
};
