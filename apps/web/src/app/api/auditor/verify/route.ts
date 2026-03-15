import { NextResponse } from "next/server";
import { verifyAuditBundle } from "@cipherpay/audit-engine";

export async function POST(request: Request) {
  const t0 = Date.now();
  console.log("[POST /api/auditor/verify] Received verification request");
  try {
    const body = await request.json();
    const entryCount = Array.isArray((body as any)?.entries) ? (body as any).entries.length : "?";
    console.log(`[POST /api/auditor/verify] Bundle has ${entryCount} entries — starting verifyAuditBundle…`);
    const result = await verifyAuditBundle(body);
    console.log(`[POST /api/auditor/verify] Completed in ${Date.now() - t0}ms — ok=${result.ok}`);
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown verification error";
    console.error(`[POST /api/auditor/verify] Error after ${Date.now() - t0}ms — ${message}`);
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
