import { cookies, headers } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "./db";

const SESSION_COOKIE_NAME =
  process.env.CIPHERPAY_SESSION_COOKIE_NAME ?? "cipherpay_session_nonce";

const IS_DEV = process.env.NODE_ENV === "development";
const DEV_BYPASS_AUTH = process.env.ZKAUDIT_DEV_BYPASS_AUTH === "true";
const DEV_BYPASS_OWNER_KEY = process.env.ZKAUDIT_DEV_USER_OWNER_KEY;

function getCookieValueFromCookieHeader(
  cookieHeader: string | null,
  name: string
): string | undefined {
  if (!cookieHeader) return undefined;
  const segments = cookieHeader.split(/\s*;\s*/);
  for (const seg of segments) {
    const eq = seg.indexOf("=");
    if (eq === -1) continue;
    const key = seg.slice(0, eq).trim();
    const val = seg.slice(eq + 1).trim();
    if (key === name) {
      try {
        return decodeURIComponent(val);
      } catch {
        return val;
      }
    }
  }
  return undefined;
}

async function getUserFromJwtBearer(
  authHeader: string | null
): Promise<AuthenticatedUser | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  const secret =
    process.env.CIPHERPAY_JWT_SECRET ?? process.env.JWT_SECRET ?? "";
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ["HS256"]
    });
    const sub = payload.sub;
    if (!sub) return null;
    const user = await prisma.users.findUnique({
      where: { id: BigInt(sub) }
    });
    if (!user) return null;
    return {
      id: user.id,
      owner_cipherpay_pub_key: user.owner_cipherpay_pub_key,
      username: user.username,
      solana_wallet_address: user.solana_wallet_address
    };
  } catch {
    return null;
  }
}

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
  const h = await headers();
  const nonce =
    getCookieValueFromCookieHeader(h.get("cookie"), SESSION_COOKIE_NAME) ??
    (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (nonce) {
    const session = await prisma.sessions.findFirst({
      where: {
        nonce,
        expires_at: { gt: new Date() }
      },
      include: { users: true }
    });
    if (session) {
      return {
        id: session.users.id,
        owner_cipherpay_pub_key: session.users.owner_cipherpay_pub_key,
        username: session.users.username,
        solana_wallet_address: session.users.solana_wallet_address
      };
    }
  }

  const jwtUser = await getUserFromJwtBearer(h.get("authorization"));
  if (jwtUser) return jwtUser;

  const devUser = await getDevBypassUser();
  if (devUser) return devUser;
  return null;
}

export async function requireCurrentUserFromSession(): Promise<AuthenticatedUser> {
  const user = await getCurrentUserFromSession();
  if (!user) {
    throw new Error("Unauthorized: no valid CipherPay session");
  }
  return user;
}

/** For GET /api/debug/cipherpay-session when ZKAUDIT_AUTH_DEBUG=1 — no secrets leaked */
export async function getCipherpaySessionAuthDiagnostics(): Promise<{
  cookieName: string;
  cookiePresent: boolean;
  cookiePresentInRawHeader: boolean;
  sessionRowFound: boolean;
  jwtSecretConfigured: boolean;
  dbTarget: string | null;
}> {
  const h = await headers();
  const raw = h.get("cookie");
  const fromRaw = !!getCookieValueFromCookieHeader(raw, SESSION_COOKIE_NAME);
  const nonce =
    getCookieValueFromCookieHeader(raw, SESSION_COOKIE_NAME) ??
    (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const cookiePresent = !!nonce;
  let sessionRowFound = false;
  if (nonce) {
    const row = await prisma.sessions.findFirst({
      where: {
        nonce,
        expires_at: { gt: new Date() }
      }
    });
    sessionRowFound = !!row;
  }
  const dbUrl = process.env.DATABASE_URL;
  let dbTarget: string | null = null;
  if (dbUrl) {
    try {
      const u = new URL(dbUrl.replace(/^mysql:\/\//, "http://"));
      const dbName = u.pathname.replace(/^\//, "").split("?")[0];
      dbTarget = `${u.hostname}:${u.port || "3306"}/${dbName}`;
    } catch {
      dbTarget = "(unparseable DATABASE_URL)";
    }
  }
  const jwtSecretConfigured = !!(
    process.env.CIPHERPAY_JWT_SECRET ?? process.env.JWT_SECRET
  );
  return {
    cookieName: SESSION_COOKIE_NAME,
    cookiePresent,
    cookiePresentInRawHeader: fromRaw,
    sessionRowFound,
    jwtSecretConfigured,
    dbTarget
  };
}
