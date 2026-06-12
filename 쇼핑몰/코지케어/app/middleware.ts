import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "cz_session";

const PUBLIC_EXACT = new Set<string>([
  "/",
  "/login",
  "/admin/login",
  "/admin/403",
  "/admin/404",
  "/admin/session-expired",
  "/api/health",
  "/favicon.ico",
  "/robots.txt",
]);

// 스토어프론트(상품 열람·정보·가입)는 비로그인도 접근 가능
const PUBLIC_PREFIX = ["/api/auth/", "/api/biz/signup", "/_next/", "/assets/", "/images/", "/promo/", "/uploads/", "/shop/", "/info/", "/auth/"];

function isPublic(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  for (const p of PUBLIC_PREFIX) {
    if (pathname.startsWith(p)) return true;
  }
  return false;
}

function redirectToGate(req: NextRequest, target: string): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = target;
  url.search = "";
  return NextResponse.redirect(url);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const gate = pathname.startsWith("/admin") ? "/admin/login" : "/login";
    return redirectToGate(req, gate);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|logo.png|assets|images|promo|uploads).+)",
  ],
};
