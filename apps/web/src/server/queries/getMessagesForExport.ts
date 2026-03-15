import { Prisma } from "@prisma/client";
import { prisma } from "../db";

export interface ExportMessageRow {
  id: bigint;
  kind: string;
  amount: string | null;
  sender_key: string | null;
  sender_name: string | null;
  recipient_key: string | null;
  recipient_name: string | null;
  created_at: Date | null;
  /** tx_signature from messages row (set by eventListener after on-chain confirmation) */
  tx_signature: string | null;
  /** tx_signature from nullifiers row (set when nullifier was indexed) */
  nullifier_tx_sig: string | null;
  /** unix seconds when the nullifier was spent (from nullifiers.spent_at) */
  spent_at_unix: number | null;
  nullifier_hex: string | null;
  proof_hex: string | null;
  proof_public_signals: string | null;
  verifier_key_id: string;
  nullifier_record_pda: string | null;
}

export async function getMessagesForExport(
  ownerCipherPayPubKey: string,
  selectedIds: bigint[]
): Promise<ExportMessageRow[]> {
  if (selectedIds.length === 0) {
    return [];
  }

  const rows = await prisma.$queryRaw<ExportMessageRow[]>(
    Prisma.sql`
      SELECT
        m.id,
        m.kind,
        m.amount,
        m.sender_key,
        us.username               AS sender_name,
        m.recipient_key,
        ur.username               AS recipient_name,
        m.created_at,
        m.tx_signature,
        n.tx_signature            AS nullifier_tx_sig,
        UNIX_TIMESTAMP(n.spent_at) AS spent_at_unix,
        m.nullifier_hex,
        m.proof_hex,
        m.proof_public_signals,
        m.verifier_key_id,
        n.pda_address             AS nullifier_record_pda
      FROM messages m
      LEFT JOIN nullifiers n
        ON m.nullifier_hex = n.nullifier_hex
      LEFT JOIN users us
        ON m.sender_key = us.owner_cipherpay_pub_key
      LEFT JOIN users ur
        ON m.recipient_key = ur.owner_cipherpay_pub_key
      WHERE
        m.id IN (${Prisma.join(selectedIds)})
        AND (
          m.sender_key = ${ownerCipherPayPubKey}
          OR m.recipient_key = ${ownerCipherPayPubKey}
        )
      ORDER BY m.created_at DESC
    `
  );

  return rows;
}
