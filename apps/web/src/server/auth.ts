import { cookies } from "next/headers";
import { prisma } from "./db";

const SESSION_COOKIE_NAME =
  process.env.CIPHERPAY_SESSION_COOKIE_NAME ?? "cipherpay_session_nonce";

const IS_DEV = process.env.NODE_ENV === "development";
const DEV_BYPASS_AUTH = process.env.ZKAUDIT_DEV_BYPASS_AUTH === "true";
const DEV_BYPASS_OWNER_KEY = process.env.ZKAUDIT_DEV_USER_OWNER_KEY;

export interface AuthenticatedUser {
  id: bigint;
  owner_cipherpay_pub_key: string;
  username: string;
  solana_wallet_address: string | null;
}

async function getDevBypassUser(): Promise<AuthenticatedUser | null> {
  if (!IS_DEV || !DEV_BYPASS_AUTH) {
    return null;
  }

  const userRow = await prisma.users.findFirst({
    where: DEV_BYPASS_OWNER_KEY
      ? { owner_cipherpay_pub_key: DEV_BYPASS_OWNER_KEY }
      : undefined
  });

  if (!userRow) {
    return null;
  }

  return {
    id: userRow.id,
    owner_cipherpay_pub_key: userRow.owner_cipherpay_pub_key,
    username: userRow.username,
    solana_wallet_address: userRow.solana_wallet_address
  };
}

export async function getCurrentUserFromSession(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    const devUser = await getDevBypassUser();
    if (devUser) return devUser;
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
    const devUser = await getDevBypassUser();
    if (devUser) return devUser;
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
