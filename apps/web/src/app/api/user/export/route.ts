import { NextResponse } from "next/server";
import { buildUnsignedAuditBundle } from "@cipherpay/audit-export";
import { requireCurrentUserFromSession } from "@/server/auth";
import { getMessagesForExport } from "@/server/queries/getMessagesForExport";

interface ExportRequestBody {
  disclosureLevel: "protocol_only" | "amount_only" | "recipient_only" | "full";
  ownerWalletPubkey: string;
  selectedIds: string[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExportRequestBody;

    if (!body.ownerWalletPubkey || typeof body.ownerWalletPubkey !== "string") {
      return NextResponse.json(
        { ok: false, error: "Missing ownerWalletPubkey" },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.selectedIds) || body.selectedIds.length === 0) {
      return NextResponse.json(
        { ok: false, error: "selectedIds is required" },
        { status: 400 }
      );
    }

    const user = await requireCurrentUserFromSession();

    if (
      user.solana_wallet_address &&
      user.solana_wallet_address !== body.ownerWalletPubkey
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Connected wallet does not match the authenticated user wallet"
        },
        { status: 403 }
      );
    }

    const selectedIdsBigInt = body.selectedIds.map((id) => {
      try {
        return BigInt(id);
      } catch {
        throw new Error(`Invalid selected id: ${id}`);
      }
    });

    const rows = await getMessagesForExport(
      user.owner_cipherpay_pub_key,
      selectedIdsBigInt
    );

    if (rows.length !== selectedIdsBigInt.length) {
      return NextResponse.json(
        {
          ok: false,
          error: "Some selected messages were not found or do not belong to the authenticated user"
        },
        { status: 403 }
      );
    }

    const unsignedBundle = await buildUnsignedAuditBundle({
      header: {
        bundle_id: crypto.randomUUID(),
        created_at_unix: Math.floor(Date.now() / 1000),
        created_at_iso: new Date().toISOString(),
        network: "solana-devnet",
        program_id: process.env.CIPHERPAY_PROGRAM_ID ?? "",
        tree_account: "CanonicalTree11111111111111111111111111111111",
        verifier_key_id: "groth16_bn254_v1",
        owner: {
          wallet_pubkey: body.ownerWalletPubkey,
          cipherpay_identity_commitment: user.owner_cipherpay_pub_key
        },
        purpose: "audit_export_v1",
        notes: `Exported ${body.selectedIds.length} item(s)`
      },
      messages: rows.map((row) => ({
        id: row.id.toString(),
        kind: row.kind,
        amount: row.amount,
        sender_key: row.sender_key,
        sender_name: row.sender_name,
        recipient_key: row.recipient_key,
        recipient_name: row.recipient_name,
        created_at: row.created_at,
        tx_signature: row.tx_signature,
        nullifier_tx_sig: row.nullifier_tx_sig,
        spent_at_unix: row.spent_at_unix != null ? Number(row.spent_at_unix) : null,
        nullifier_hex: row.nullifier_hex,
        nullifier_record_pda: row.nullifier_record_pda,
        proof_hex: row.proof_hex,
        proof_public_signals: row.proof_public_signals,
        verifier_key_id: row.verifier_key_id,
      })),
      disclosureLevel: body.disclosureLevel ?? "full"
    });

    return NextResponse.json({
      ok: true,
      unsignedBundle
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to export bundle";

    const status = message.includes("Unauthorized") ? 401 : 500;

    return NextResponse.json(
      {
        ok: false,
        error: message
      },
      { status }
    );
  }
}
