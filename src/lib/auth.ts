import jwt, { type JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "dositime_session";

export type Session = {
  id: string;
  email: string;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET ist nicht konfiguriert.");
  }

  return secret;
}

export function createSessionToken(session: Session) {
  return jwt.sign(session, getJwtSecret(), { expiresIn: "7d" });
}

export function verifySessionToken(token: string): Session | null {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as JwtPayload;

    if (typeof payload.id !== "string" || typeof payload.email !== "string") {
      return null;
    }

    return { id: payload.id, email: payload.email };
  } catch {
    return null;
  }
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  return token ? verifySessionToken(token) : null;
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};
