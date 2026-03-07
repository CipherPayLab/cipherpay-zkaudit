export type ActivityKind = "deposit" | "transfer" | "withdraw";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  counterparty?: string;
  amount: string;
  token_symbol: string;
  tx_signature?: string;
  nullifier_hex?: string | null;
  proof_hex?: string | null;
  proof_public_signals?: string | null;
  verifier_key_id?: string | null;
  created_at: string;
}

export interface ActivitiesApiResponse {
  ok: boolean;
  items: ActivityItem[];
}
