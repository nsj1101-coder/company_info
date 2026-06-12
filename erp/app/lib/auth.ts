import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET ?? "lalune-erp-dev-secret";
export const COOKIE = "le_session";

export type Session = { uid: number; name: string; role: string };

export function sign(s: Session): string {
  return jwt.sign(s, SECRET, { expiresIn: "12h" });
}

export async function getSession(): Promise<Session | null> {
  const c = await cookies();
  const token = c.get(COOKIE)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET) as Session;
  } catch {
    return null;
  }
}

// 역할 한글 라벨
export const ROLE_LABEL: Record<string, string> = {
  admin: "관리자", sales: "영업/CS", production: "생산", logistics: "물류", accounting: "회계", staff: "직원",
};
