import { Prisma } from "@prisma/client";
import { prisma } from "../db";

export interface ExportMessageRow {
  id: bigint;
  kind: string;
  amount: string | null;
  tx_signature: string | null;
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
        m.tx_signature,
        m.nullifier_hex,
        m.proof_hex,
        m.proof_public_signals,
        m.verifier_key_id,
        n.pda_address AS nullifier_record_pda
      FROM messages m
      LEFT JOIN nullifiers n
        ON m.nullifier_hex = n.nullifier_hex
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
