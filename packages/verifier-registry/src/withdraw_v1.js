export const withdrawVerifierV1 = {
    verifier_key_id: "groth16_withdraw_bn254_v1",
    event_type: "withdraw",
    proof_format: "groth16_bn254",
    public_signal_order: [
        "nullifier",
        "old_root",
        "recipient",
        "amount",
        "ownerCipherPayPubKey"
    ],
    verifying_key_path: typeof process !== "undefined" ? process.env?.CIPHERPAY_WITHDRAW_VKEY_PATH : undefined
};
