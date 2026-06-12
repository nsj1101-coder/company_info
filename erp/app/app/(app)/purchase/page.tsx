import { prisma } from "@/lib/prisma";
import { num, ymd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Purchase() {
  const [rows, shortages] = await Promise.all([
    prisma.purchaseOrder.findMany({ orderBy: { poDate: "desc" }, take: 100 }),
    prisma.inventory.findMany({ where: { shortageQty: { gt: 0 } }, orderBy: { shortageQty: "desc" }, take: 30 }),
  ]);

  return (
    <>
      <div className="panel">
        <div className="ph"><h3>발주서</h3><span className="hint">— PO-YYYY-NNN · 원부자재/임가공/완사입</span></div>
        <div className="tablewrap">
          <table className="dt">
            <thead><tr><th>발주번호</th><th>발주일</th><th>SKU</th><th>제품</th><th className="num">수량</th><th>공급사</th><th>입고예정</th><th>입고확인</th></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className="mono">{p.poNo}</td><td>{ymd(p.poDate)}</td><td className="mono">{p.sku ?? "-"}</td>
                  <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{p.productName ?? "-"}</td>
                  <td className="num">{num(p.orderQty)}</td><td>{p.supplier ?? "-"}</td><td>{ymd(p.expectedInDate)}</td>
                  <td>{p.inboundConfirm ? <span className="badge b-ok">{p.inboundConfirm}</span> : <span className="badge b-gray">대기</span>}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", padding: 30, color: "var(--sub)" }}>발주 없음</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <div className="ph"><h3>발주 필요 품목 (자동 감지)</h3><span className="hint">— 재고 부족 SKU {num(shortages.length)}건</span></div>
        <div className="tablewrap">
          <table className="dt">
            <thead><tr><th>SKU</th><th>제품명</th><th className="num">현재고</th><th className="num">안전재고</th><th className="num">부족</th><th className="num">권장발주량</th></tr></thead>
            <tbody>
              {shortages.map((s) => (
                <tr key={s.id}>
                  <td className="mono">{s.sku}</td>
                  <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>{s.productName ?? "-"}</td>
                  <td className="num" style={{ color: "var(--danger)", fontWeight: 700 }}>{num(s.currentStock)}</td>
                  <td className="num">{num(s.safeStock)}</td><td className="num">{num(s.shortageQty)}</td>
                  <td className="num" style={{ fontWeight: 700 }}>{num(s.recommendQty)}</td>
                </tr>
              ))}
              {shortages.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--sub)" }}>부족 품목 없음</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
