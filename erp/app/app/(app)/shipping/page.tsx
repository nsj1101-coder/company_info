import { prisma } from "@/lib/prisma";
import { num, won, ymd } from "@/lib/format";
import { StatusBadge } from "../page";

export const dynamic = "force-dynamic";

export default async function Shipping() {
  const [counts, pending] = await Promise.all([
    prisma.order.groupBy({ by: ["status"], _count: true }),
    prisma.order.findMany({ where: { status: { in: ["접수", "생산중", "자수대기"] } }, orderBy: { orderDate: "desc" }, take: 100 }),
  ]);
  const c = (s: string) => counts.find((x) => x.status === s)?._count ?? 0;

  return (
    <>
      <div className="kpis">
        <div className="kpi"><div className="k">접수(출고대기)</div><div className="v">{num(c("접수"))} <small>건</small></div></div>
        <div className="kpi warn"><div className="k">생산중</div><div className="v">{num(c("생산중"))} <small>건</small></div></div>
        <div className="kpi warn"><div className="k">자수대기</div><div className="v">{num(c("자수대기"))} <small>건</small></div></div>
        <div className="kpi ok"><div className="k">출고완료</div><div className="v">{num(c("출고완료"))} <small>건</small></div></div>
      </div>
      <div className="panel">
        <div className="ph"><h3>출고 대기 주문 <span className="hint">생산·자수·접수 단계 (미출고)</span></h3></div>
        <div className="tablewrap">
          <table className="dt">
            <thead><tr><th>주문번호</th><th>일자</th><th>채널</th><th>고객</th><th>상품</th><th className="num">수량</th><th className="num">금액</th><th>상태</th></tr></thead>
            <tbody>
              {pending.map((o) => (
                <tr key={o.id}>
                  <td className="mono">{o.orderNo}</td><td>{ymd(o.orderDate)}</td>
                  <td><span className="badge b-info">{o.channel ?? "-"}</span></td>
                  <td>{o.customerName ?? "-"}</td>
                  <td style={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis" }}>{o.productName ?? o.sku ?? "-"}</td>
                  <td className="num">{num(o.qty)}</td><td className="num">{won(o.totalAmount)}</td>
                  <td><StatusBadge s={o.status} /></td>
                </tr>
              ))}
              {pending.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: 30, color: "var(--sub)" }}>출고 대기 없음</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
