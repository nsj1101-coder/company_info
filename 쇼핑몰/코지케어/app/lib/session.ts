import { cookies } from "next/headers";
import { COOKIE_NAME, verifyJwt, type Role } from "@/lib/auth";

export type Session = {
  sub: string;
  role: Role;
  bizId?: number;
  email?: string;
  name?: string;
  bizName?: string;
};

export async function getCurrentSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifyJwt(token);
  if (!payload) return null;
  const role = payload.role;
  if (role !== "admin" && role !== "biz" && role !== "user") return null;
  return {
    sub: payload.sub,
    role,
    bizId: payload.bizId,
    email: payload.email,
    name: payload.name,
    bizName: payload.name,
  };
}
