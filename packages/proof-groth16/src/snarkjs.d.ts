declare module "snarkjs" {
  export interface Groth16 {
    verify(
      vkey: unknown,
      publicSignals: string[],
      proof: unknown
    ): Promise<boolean>;
  }
  export const groth16: Groth16;
}
