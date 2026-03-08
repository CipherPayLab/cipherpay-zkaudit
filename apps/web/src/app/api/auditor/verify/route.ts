import { NextResponse } from "next/server";
import { verifyAuditBundle } from "@cipherpay/audit-engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await verifyAuditBundle(body);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown verification error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
