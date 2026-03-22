import { NextResponse } from "next/server";
import { getCurrentUserFromSession } from "@/server/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/user/me
 * Returns the current user from the session cookie, or 401 if no valid session.
 * Use this to verify that the audit app sees the shared CipherPay session cookie.
 */
export async function GET() {
  const user = await getCurrentUserFromSession();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "No valid CipherPay session" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id.toString(),
      username: user.username,
      owner_cipherpay_pub_key: user.owner_cipherpay_pub_key,
      solana_wallet_address: user.solana_wallet_address
    }
  });
}
