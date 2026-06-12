"use client";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

type NavItem = { href: string; label: string; ic: string; roles?: string[] };
type Grp = { grp: string; items: NavItem[] };

const MENU: Grp[] = [
  { grp: "", items: [{ href: "/", label: "대시보드", ic: "📊" }] },
  {
    grp: "주문 / 출고",
    items: [
      { href: "/orders", label: "통합 주문", ic: "🧾" },
      { href: "/orders/upload", label: "채널 주문 수집", ic: "📥" },
      { href: "/shipping", label: "출고 관리", ic: "🚚" },
    ],
  },
  {
    grp: "운영",
    items: [
      { href: "/production", label: "생산 관리", ic: "🏭", roles: ["admin", "production"] },
      { href: "/purchase", label: "발주·구매", ic: "🛒", roles: ["admin", "production", "accounting"] },
      { href: "/inventory", label: "재고 관리", ic: "📦" },
      { href: "/returns", label: "반품 관리", ic: "↩" },
    ],
  },
  {
    grp: "기준정보",
    items: [
      { href: "/products", label: "상품 / SKU", ic: "👕" },
      { href: "/customers", label: "고객 관리", ic: "👤" },
    ],
  },
  {
    grp: "분석",
    items: [{ href: "/analytics", label: "정산·분석", ic: "📈", roles: ["admin", "accounting"] }],
  },
];

const TITLES: [string, string][] = [
  ["/orders/upload", "채널 주문 수집"], ["/orders", "통합 주문"], ["/shipping", "출고 관리"],
  ["/production", "생산 관리"], ["/purchase", "발주·구매"], ["/inventory", "재고 관리"],
  ["/returns", "반품 관리"], ["/products", "상품 / SKU"], ["/customers", "고객 관리"],
  ["/analytics", "정산·분석"], ["/", "대시보드"],
];

export default function Shell({
  children, session,
}: {
  children: React.ReactNode;
  session: { name: string; role: string };
}) {
  const path = usePathname();
  const router = useRouter();
  const title = TITLES.find(([p]) => (p === "/" ? path === "/" : path.startsWith(p)))?.[1] ?? "";

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  const can = (it: NavItem) => !it.roles || it.roles.includes(session.role);
  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <div className="shell">
      <nav className="side">
        <div className="brand"><b>LALUNE</b> 통합 ERP</div>
        {MENU.map((g, i) => (
          <div key={i}>
            {g.grp && <div className="grp">{g.grp}</div>}
            {g.items.filter(can).map((it) => (
              <Link key={it.href} href={it.href} className={"nav" + (active(it.href) ? " on" : "")}>
                <span className="ic">{it.ic}</span> {it.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="main">
        <header className="top">
          <div className="title">{title}</div>
          <div className="sp" />
          <div className="who">{session.name} · {roleLabel(session.role)}</div>
          <button className="btn ghost" onClick={logout} style={{ padding: "6px 12px" }}>로그아웃</button>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}

function roleLabel(r: string) {
  return ({ admin: "관리자", sales: "영업/CS", production: "생산", logistics: "물류", accounting: "회계", staff: "직원" } as Record<string, string>)[r] ?? r;
}
