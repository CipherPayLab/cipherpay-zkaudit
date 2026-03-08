import { cookies } from "next/headers";
import { prisma } from "./db";

const SESSION_COOKIE_NAME =
  process.env.CIPHERPAY_SESSION_COOKIE_NAME ?? "cipherpay_session_nonce";

export interface AuthenticatedUser {
  id: bigint;
  owner_cipherpay_pub_key: string;
  username: string;
  solana_wallet_address: string | null;
}

export async function getCurrentUserFromSession(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  const session = await prisma.sessions.findFirst({
    where: {
      nonce: sessionCookie.value,
      expires_at: { gt: new Date() }
    },
    include: { users: true }
  });

  if (!session) {
    return null;
  }

  return {
    id: session.users.id,
    owner_cipherpay_pub_key: session.users.owner_cipherpay_pub_key,
    username: session.users.username,
    solana_wallet_address: session.users.solana_wallet_address
  };
}

export async function requireCurrentUserFromSession(): Promise<AuthenticatedUser> {
  const user = await getCurrentUserFromSession();
  if (!user) {
    throw new Error("Unauthorized: no valid CipherPay session");
  }
  return user;
}
