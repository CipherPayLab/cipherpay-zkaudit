import { NextResponse } from "next/server";
import { getCipherpaySessionAuthDiagnostics } from "@/server/auth";

export const dynamic = "force-dynamic";

/**
 * Temporary diagnostics when ZKAUDIT_AUTH_DEBUG=1 on the Next server:
 * - cookiePresent: browser sent the shared CipherPay session cookie to zkaudit
 * - sessionRowFound: that nonce exists in THIS app's DB (must match cipherpay-server DB)
 *
 * 401 on /api/user/* usually means cookiePresent=false (Domain / Secure on cipherpay-server)
 * or sessionRowFound=false (wrong DATABASE_URL on zkaudit, or stale cookie).
 */
export async function GET() {
  if (process.env.ZKAUDIT_AUTH_DEBUG !== "true" && process.env.ZKAUDIT_AUTH_DEBUG !== "1") {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  const d = await getCipherpaySessionAuthDiagnostics();
  return NextResponse.json({ ok: true, ...d });
}
