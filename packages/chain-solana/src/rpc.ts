import { Connection } from "@solana/web3.js";

export function getSolanaRpcUrl(): string {
  return process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
}

export function getSolanaConnection(): Connection {
  return new Connection(getSolanaRpcUrl(), "confirmed");
}
