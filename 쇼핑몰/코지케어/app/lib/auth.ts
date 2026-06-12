import jwt, { SignOptions } from "jsonwebtoken";
import { cookies } from "next/headers";

export const COOKIE_NAME = "cz_session";
const JWT_SECRET = process.env.JWT_SECRET ?? "cozycare-dev-secret-change-in-prod";

export type Role = "admin" | "biz" | "user";

export type Session = {
  sub: string;
  role: Role;
  bizId?: number;
};

export type SessionPayload = Session & {
  email?: string;
  name?: string;
};

export function signJwt(
  payload: { sub: string; role: Role; bizId?: number; email?: string; name?: string },
  ttlSec: number = 60 * 60 * 12
): string {
  const opts: SignOptions = { expiresIn: ttlSec };
  return jwt.sign(payload, JWT_SECRET, opts);
}

export function verifyJwt(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function signToken(payload: SessionPayload): string {
  return signJwt(payload, 60 * 60 * 24 * 7);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  return verifyJwt(token);
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyJwt(token);
  if (!payload) return null;
  const role = payload.role as Role;
  if (role !== "admin" && role !== "biz" && role !== "user") return null;
  return { sub: payload.sub, role, bizId: payload.bizId };
}
