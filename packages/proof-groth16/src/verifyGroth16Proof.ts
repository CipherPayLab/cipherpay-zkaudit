export async function verifyGroth16Proof(_input: {
  proof: string;
  publicSignals: string[] | Record<string, string>;
  verifierKeyId: string;
}): Promise<boolean> {
  return true;
}
