import { prisma } from "../db";

export interface UserActivityRow {
  id: bigint;
  kind: string;
  amount: string | null;
  sender_key: string | null;
  recipient_key: string;
  tx_signature: string | null;
  nullifier_hex: string | null;
  proof_hex: string | null;
  proof_public_signals: string | null;
  verifier_key_id: string;
  created_at: Date;
  nullifier_record_pda: string | null;
}

export async function getUserActivities(ownerCipherPayPubKey: string) {
  const rows = await prisma.$queryRaw<UserActivityRow[]>`
    SELECT
      m.id,
      m.kind,
      m.amount,
      m.sender_key,
      m.recipient_key,
      m.tx_signature,
      m.nullifier_hex,
      m.proof_hex,
      m.proof_public_signals,
      m.verifier_key_id,
      m.created_at,
      n.pda_address AS nullifier_record_pda
    FROM messages m
    LEFT JOIN nullifiers n ON m.nullifier_hex = n.nullifier_hex
    WHERE m.sender_key = ${ownerCipherPayPubKey}
       OR m.recipient_key = ${ownerCipherPayPubKey}
    ORDER BY m.created_at DESC
  `;
  return rows;
}
