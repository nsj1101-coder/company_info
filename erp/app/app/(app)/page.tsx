import { prisma } from "@/lib/prisma";
import { won, num, eok, ymd } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [products, customers, orders, revAgg, byChannel, byStatus, lowStock, soldOut, recent, shortages] = await Promise.all([
    prisma.product.count(),
    prisma.customer.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true, qty: true } }),
    prisma.order.groupBy({ by: ["channel"], _sum: { totalAmount: true }, _count: true }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.inventory.count({ where: { status: "부족" } }),
    prisma.inventory.count({ where: { status: "품절" } }),
    prisma.order.findMany({ take: 8, orderBy: { orderDate: "desc" }, where: { orderDate: { not: null } } }),
    prisma.inventory.findMany({ where: { shortageQty: { gt: 0 } }, orderBy: { shortageQty: "desc" }, take: 6 }),
  ]);

  const channels = byChannel
    .filter((c) => c.channel && (c._sum.totalAmount ?? 0) > 0)
    .map((c) => ({ name: c.channel!, amt: c._sum.totalAmount ?? 0, cnt: c._count }))
    .sort((a, b) => b.amt - a.amt);
  const maxCh = Math.max(1, ...channels.map((c) => c.amt));
  const statusOrder = ["접수", "생산중", "자수대기", "출고완료", "반품/취소"];
  const statuses = statusOrder
    .map((s) => ({ s, n: byStatus.find((x) => x.status === s)?._count ?? 0 }));

  return (
    <>
      <div className="kpis">
        <Kpi k="총 매출 (누적)" v={eok(revAgg._sum.totalAmount)} unit="원" />
        <Kpi k="총 주문" v={num(orders)} unit="건" />
        <Kpi k="총 SKU" v={num(products)} unit="개" />
        <Kpi k="총 고객" v={num(customers)} unit="명" />
      </div>
      <div className="kpis">
        <Kpi k="총 판매수량" v={num(revAgg._sum.qty)} unit="개" />
        <Kpi k="출고완료" v={num(byStatus.find((x) => x.status === "출고완료")?._count ?? 0)} unit="건" cls="ok" />
        <Kpi k="재고 부족 SKU" v={num(lowStock)} unit="품목" cls="warn" />
        <Kpi k="품절 SKU" v={num(soldOut)} unit="품목" cls="danger" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
        <div className="panel">
          <div className="ph"><h3>채널별 매출</h3><span className="hint">— 통합 주문 기준 (3개 몰 + 오프라인)</span></div>
          <div style={{ padding: 16 }}>
            <div className="barwrap">
              {channels.map((c) => (
                <div className="bar" key={c.name}>
                  <span className="lbl">{c.name}</span>
                  <span className="track"><span className="fill" style={{ width: `${(c.amt / maxCh) * 100}%` }} /></span>
                  <span className="amt">{won(c.amt)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="ph"><h3>주문 상태</h3></div>
          <div style={{ padding: 16 }}>
            <div className="barwrap">
              {statuses.map((s) => (
                <div className="bar" key={s.s}>
                  <span className="lbl">{s.s}</span>
                  <span className="track"><span className="fill" style={{ width: `${(s.n / Math.max(1, ...statuses.map((x) => x.n))) * 100}%`, background: barColor(s.s) }} /></span>
                  <span className="amt">{num(s.n)}건</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
        <div className="panel">
          <div className="ph"><h3>최근 주문</h3><span className="sp" /><Link href="/orders" className="hint">전체 보기 →</Link></div>
          <div className="tablewrap">
            <table className="dt">
              <thead><tr><th>주문번호</th><th>일자</th><th>채널</th><th>상품</th><th className="num">수량</th><th className="num">금액</th><th>상태</th></tr></thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id}>
                    <td className="mono">{o.orderNo}</td>
                    <td>{ymd(o.orderDate)}</td>
                    <td><span className="badge b-info">{o.channel ?? "-"}</span></td>
                    <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>{o.productName ?? o.sku ?? "-"}</td>
                    <td className="num">{num(o.qty)}</td>
                    <td className="num">{won(o.totalAmount)}</td>
                    <td><StatusBadge s={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="ph"><h3>발주 필요 품목</h3><span className="sp" /><Link href="/purchase" className="hint">발주 →</Link></div>
          <div className="tablewrap">
            <table className="dt">
              <thead><tr><th>SKU</th><th className="num">현재고</th><th className="num">안전</th><th className="num">권장발주</th></tr></thead>
              <tbody>
                {shortages.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--sub)", padding: 24 }}>부족 품목 없음</td></tr>}
                {shortages.map((s) => (
                  <tr key={s.id}>
                    <td className="mono">{s.sku}</td>
                    <td className="num" style={{ color: "var(--danger)", fontWeight: 700 }}>{num(s.currentStock)}</td>
                    <td className="num">{num(s.safeStock)}</td>
                    <td className="num" style={{ fontWeight: 700 }}>{num(s.recommendQty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

function Kpi({ k, v, unit, cls }: { k: string; v: string; unit?: string; cls?: string }) {
  return (
    <div className={"kpi" + (cls ? " " + cls : "")}>
      <div className="k">{k}</div>
      <div className="v">{v}{unit && <small> {unit}</small>}</div>
    </div>
  );
}

export function StatusBadge({ s }: { s: string | null }) {
  const map: Record<string, string> = {
    출고완료: "b-ok", 접수: "b-info", 생산중: "b-warn", 자수대기: "b-warn", "반품/취소": "b-danger",
  };
  return <span className={"badge " + (map[s ?? ""] ?? "b-gray")}>{s ?? "-"}</span>;
}

function barColor(s: string) {
  return ({ 출고완료: "#137a4b", "반품/취소": "#c5221f", 생산중: "#b45309", 자수대기: "#b45309" } as Record<string, string>)[s] ?? "var(--brand)";
}
