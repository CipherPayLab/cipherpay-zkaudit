export type ActivityKind = "deposit" | "transfer" | "withdraw";

export interface ActivityItem {
  id: string;
  kind: ActivityKind;
  counterparty?: string;
  sender_key?: string | null;
  sender_name?: string | null;
  recipient_key?: string | null;
  recipient_name?: string | null;
  amount: string;
  token_symbol: string;
  tx_signature?: string;
  nullifier_hex?: string | null;
  nullifier_record_pda?: string | null;
  proof_hex?: string | null;
  proof_public_signals?: string | null;
  verifier_key_id?: string | null;
  created_at: string;
}

export interface ActivitiesApiResponse {
  ok: boolean;
  items: ActivityItem[];
}
