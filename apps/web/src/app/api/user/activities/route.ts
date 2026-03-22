import { NextResponse } from "next/server";
import type { ActivitiesApiResponse, ActivityItem } from "@/types/activity";
import { requireCurrentUserFromSession } from "@/server/auth";

export const dynamic = "force-dynamic";
import {
  getUserActivities,
  type UserActivityRow
} from "@/server/queries/getUserActivities";

function normalizeActivityKind(dbKind: string): ActivityItem["kind"] {
  switch (dbKind) {
    case "note-transfer":
      return "transfer";
    case "note-withdraw":
      return "withdraw";
    case "note-deposit":
      return "deposit";
    default:
      return (dbKind as ActivityItem["kind"]) || "deposit";
  }
}

function mapRowToActivityItem(
  row: UserActivityRow,
  ownerCipherPayPubKey: string
): ActivityItem {
  let counterparty: string | undefined;

  if (row.sender_key === ownerCipherPayPubKey && row.recipient_key !== ownerCipherPayPubKey) {
    counterparty = row.recipient_key;
  } else if (
    row.recipient_key === ownerCipherPayPubKey &&
    row.sender_key &&
    row.sender_key !== ownerCipherPayPubKey
  ) {
    counterparty = row.sender_key;
  }

  const kind = normalizeActivityKind(row.kind);

  return {
    id: row.id.toString(),
    kind,
    counterparty,
    sender_key: row.sender_key,
    sender_name: row.sender_name ?? null,
    recipient_key: row.recipient_key,
    recipient_name: row.recipient_name ?? null,
    amount: row.amount ?? "0",
    token_symbol: "SOL",
    tx_signature: row.tx_signature ?? undefined,
    nullifier_hex: row.nullifier_hex,
    nullifier_record_pda: row.nullifier_record_pda,
    proof_hex: row.proof_hex,
    proof_public_signals: row.proof_public_signals,
    verifier_key_id: row.verifier_key_id ?? null,
    created_at: row.created_at.toISOString()
  };
}

export async function GET() {
  try {
    const user = await requireCurrentUserFromSession();
    const rows = await getUserActivities(user.owner_cipherpay_pub_key);

    const items = rows.map((row: UserActivityRow) =>
      mapRowToActivityItem(row, user.owner_cipherpay_pub_key)
    );

    const response: ActivitiesApiResponse = {
      ok: true,
      items
    };

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load activities";
    const status = message.includes("Unauthorized") ? 401 : 500;
    return NextResponse.json(
      { ok: false, error: message },
      { status }
    );
  }
}
