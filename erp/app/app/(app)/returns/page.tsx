import { prisma } from "@/lib/prisma";
import { num, ymd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Returns() {
  const rows = await prisma.return.findMany({ orderBy: { returnDate: "desc" }, take: 200 });
  const totalQty = rows.reduce((s, r) => s + r.returnQty, 0);

  return (
    <>
      <div className="kpis">
        <div className="kpi"><div className="k">총 반품건</div><div className="v">{num(rows.length)} <small>건</small></div></div>
        <div className="kpi danger"><div className="k">총 반품수량</div><div className="v">{num(totalQty)} <small>개</small></div></div>
      </div>
      <div className="panel">
        <div className="ph"><h3>반품 관리</h3><span className="hint">— RTN-YYYY-NNN · 카페24/주문서 자동 집계</span></div>
        <div className="tablewrap">
          <table className="dt">
            <thead><tr><th>반품번호</th><th>반품일</th><th>반품처</th><th>주문번호</th><th>SKU</th><th>제품</th><th className="num">반품수량</th><th>사유</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{r.returnNo}</td><td>{ymd(r.returnDate)}</td><td>{r.returnPlace ?? "-"}</td>
                  <td className="mono">{r.orderNo ?? "-"}</td><td className="mono">{r.sku ?? "-"}</td>
                  <td>{r.productName ?? "-"}</td><td className="num">{num(r.returnQty)}</td><td>{r.reason ?? "-"}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: 30, color: "var(--sub)" }}>반품 없음</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
