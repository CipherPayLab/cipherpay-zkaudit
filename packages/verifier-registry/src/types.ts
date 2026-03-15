export interface VerifierDefinition {
  verifier_key_id: string;
  event_type: "transfer" | "withdraw" | "deposit";
  proof_format: "groth16_bn254";
  public_signal_order: readonly string[];
}
