export function getSolanaRpcUrl(): string {
  return process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
}
