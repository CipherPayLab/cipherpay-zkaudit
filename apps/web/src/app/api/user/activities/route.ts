import { NextResponse } from "next/server";
import type { ActivitiesApiResponse } from "@/types/activity";

const MOCK_ITEMS: ActivitiesApiResponse["items"] = [
  {
    id: "msg_1001",
    kind: "transfer",
    counterparty: "@alice",
    amount: "0.83",
    token_symbol: "SOL",
    tx_signature: "5sC8mockTxSig111111111111111111111111111111111",
    nullifier_hex: "a1".repeat(32),
    proof_hex: "0xdeadbeeftransferproof1",
    proof_public_signals: JSON.stringify(["0xnullifier1", "0xoldroot1", "0xnewroot1a", "0xnewroot1b", "0xoutcommit1", "0xoutcommit2", "0xownerkey1", "42"]),
    verifier_key_id: "groth16_bn254_v1",
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: "msg_1002",
    kind: "withdraw",
    amount: "1.20",
    token_symbol: "SOL",
    tx_signature: "8fY9mockTxSig222222222222222222222222222222222",
    nullifier_hex: "b2".repeat(32),
    proof_hex: "0xdeadbeefwithdrawproof2",
    proof_public_signals: JSON.stringify(["0xnullifier2", "0xoldroot2", "0xnewroot2a", "0xnewroot2b", "0xoutcommit3", "0xoutcommit4", "0xownerkey2", "44"]),
    verifier_key_id: "groth16_bn254_v1",
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString()
  },
  {
    id: "msg_1003",
    kind: "deposit",
    amount: "2.50",
    token_symbol: "SOL",
    tx_signature: "9zQ2mockTxSig333333333333333333333333333333333",
    proof_hex: null,
    proof_public_signals: null,
    verifier_key_id: null,
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString()
  }
];

export async function GET() {
  return NextResponse.json({ ok: true, items: MOCK_ITEMS });
}
