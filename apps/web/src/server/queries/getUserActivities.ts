import { prisma } from "../db";

export interface UserActivityRow {
  id: bigint;
  kind: string;
  amount: string | null;
  sender_key: string | null;
  sender_name: string | null;
  recipient_key: string;
  recipient_name: string | null;
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
      us.username    AS sender_name,
      m.recipient_key,
      ur.username    AS recipient_name,
      m.tx_signature,
      m.nullifier_hex,
      m.proof_hex,
      m.proof_public_signals,
      m.verifier_key_id,
      m.created_at,
      n.pda_address  AS nullifier_record_pda
    FROM messages m
    LEFT JOIN nullifiers n  ON m.nullifier_hex = n.nullifier_hex
    LEFT JOIN users us      ON m.sender_key    = us.owner_cipherpay_pub_key
    LEFT JOIN users ur      ON m.recipient_key = ur.owner_cipherpay_pub_key
    WHERE (m.sender_key = ${ownerCipherPayPubKey}
       OR m.recipient_key = ${ownerCipherPayPubKey})
      AND NOT (m.kind = 'note-transfer' AND m.sender_key = m.recipient_key)
    ORDER BY m.created_at DESC
  `;
  return rows;
}
