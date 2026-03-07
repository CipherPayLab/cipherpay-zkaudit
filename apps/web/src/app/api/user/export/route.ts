import { NextResponse } from "next/server";
import { buildAuditBundle } from "@cipherpay/audit-export";
import type { ActivityItem } from "@/types/activity";

interface ExportRequestBody {
  disclosureLevel: "protocol_only";
  selectedIds: string[];
  selectedItems: ActivityItem[];
}

export async function POST(request: Request) {
  const body = (await request.json()) as ExportRequestBody;

  const bundle = buildAuditBundle({
    header: {
      bundle_id: crypto.randomUUID(),
      created_at_unix: Math.floor(Date.now() / 1000),
      created_at_iso: new Date().toISOString(),
      network: "solana-devnet",
      program_id: "CipherPayProgram1111111111111111111111111111111",
      tree_account: "CanonicalTree11111111111111111111111111111111",
      verifier_key_id: "groth16_bn254_v1",
      owner: {
        wallet_pubkey: "UserWallet111111111111111111111111111111111",
        cipherpay_identity_commitment: "0xownercommitment"
      },
      purpose: "audit_export_v1",
      notes: `Exported ${body.selectedIds.length} item(s)`
    },
    messages: body.selectedItems.map((item) => ({
      id: item.id,
      kind: item.kind,
      nullifier_hex: item.nullifier_hex,
      proof_hex: item.proof_hex,
      proof_public_signals: item.proof_public_signals,
      verifier_key_id: item.verifier_key_id,
      tx_signature: item.tx_signature,
      amount: item.amount
    }))
  });

  return NextResponse.json({
    ok: true,
    bundle
  });
}
