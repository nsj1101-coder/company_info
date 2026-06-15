import { prisma } from "@/lib/prisma";
import { won, num, eok } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Analytics() {
  const [orders, products] = await Promise.all([
    prisma.order.findMany({ select: { channel: true, sku: true, qty: true, totalAmount: true, orderDate: true, customerCode: true } }),
    prisma.product.findMany({ select: { sku: true, cost: true, name: true } }),
  ]);
  const costMap = new Map(products.map((p) => [p.sku, p.cost ?? 0]));
  const nameMap = new Map(products.map((p) => [p.sku, p.name]));

  // 채널별 P&L
  const pnl = new Map<string, { rev: number; cost: number; qty: number }>();
  const monthly = new Map<string, number>();
  const bySku = new Map<string, number>();
  const byCust = new Map<string, number>();
  for (const o of orders) {
    const ch = o.channel || "기타";
    const cost = (costMap.get(o.sku ?? "") ?? 0) * o.qty;
    const p = pnl.get(ch) ?? { rev: 0, cost: 0, qty: 0 };
    p.rev += o.totalAmount; p.cost += cost; p.qty += o.qty; pnl.set(ch, p);
    if (o.orderDate) { const m = o.orderDate.toISOString().slice(0, 7); monthly.set(m, (monthly.get(m) ?? 0) + o.totalAmount); }
    if (o.sku) bySku.set(o.sku, (bySku.get(o.sku) ?? 0) + o.totalAmount);
    if (o.customerCode) byCust.set(o.customerCode, (byCust.get(o.customerCode) ?? 0) + o.totalAmount);
  }
  const pnlRows = [...pnl.entries()].map(([ch, v]) => ({ ch, ...v, profit: v.rev - v.cost, margin: v.rev ? ((v.rev - v.cost) / v.rev) * 100 : 0 })).sort((a, b) => b.rev - a.rev);
  const totRev = pnlRows.reduce((s, r) => s + r.rev, 0);
  const totProfit = pnlRows.reduce((s, r) => s + r.profit, 0);
  const totCost = pnlRows.reduce((s, r) => s + r.cost, 0);
  // 원본 주문의 SKU가 상품마스터 코드와 체계가 달라 원가 매칭률이 낮음 → 매칭 시에만 손익 표기
  const matched = orders.filter((o) => (costMap.get(o.sku ?? "") ?? 0) > 0).length;
  const costReady = totCost > 0 && matched / Math.max(1, orders.length) > 0.3;
  const months = [...monthly.entries()].sort().slice(-6);
  const maxM = Math.max(1, ...months.map(([, v]) => v));
  const topSku = [...bySku.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  const grades = { VIP: 0, 우수: 0, 일반: 0 };
  for (const [, amt] of byCust) { if (amt >= 5000000) grades.VIP++; else if (amt >= 1000000) grades.우수++; else if (amt > 0) grades.일반++; }

  return (
    <>
      <div className="kpis">
        <div className="kpi"><div className="k">총 매출(누적)</div><div className="v">{eok(totRev)} <small>원</small></div></div>
        <div className="kpi"><div className="k">총 판매수량</div><div className="v">{num(pnlRows.reduce((s, r) => s + r.qty, 0))} <small>개</small></div></div>
        <div className="kpi"><div className="k">거래 고객수</div><div className="v">{num(byCust.size)} <small>명</small></div></div>
        <div className="kpi"><div className="k">우수+VIP 고객</div><div className="v">{num(grades.VIP + grades.우수)} <small>명</small></div></div>
      </div>

      <div className="panel">
        <div className="ph"><h3>채널별 {costReady ? "손익 (P&L)" : "매출"}</h3><span className="hint">{costReady ? "— 원가는 상품마스터 매칭 기준 추정" : "— 통합 주문 기준"}</span></div>
        {!costReady && (
          <div style={{ margin: "0 16px 12px", padding: "9px 13px", background: "#f1f2f4", color: "#4b5159", border: "1px solid #e2e4e8", borderRadius: 8, fontSize: 12.5 }}>
            ※ 손익(원가·이익) 분석은 <b>주문↔상품 SKU 매칭</b> 후 산출됩니다. 현재 원본 데이터의 SKU 체계가 채널마다 달라 매칭률이 낮습니다 — <b>SKU 표준화(2차 과제)</b> 완료 시 채널별 원가·마진이 자동 표기됩니다.
          </div>
        )}
        <div className="tablewrap">
          <table className="dt">
            <thead><tr><th>채널</th><th className="num">매출</th>{costReady && <><th className="num">추정원가</th><th className="num">이익</th><th className="num">마진율</th></>}<th className="num">비중</th><th className="num">판매수량</th></tr></thead>
            <tbody>
              {pnlRows.map((r) => (
                <tr key={r.ch}>
                  <td><span className="badge b-info">{r.ch}</span></td>
                  <td className="num">{won(r.rev)}</td>
                  {costReady && <><td className="num">{won(r.cost)}</td><td className="num" style={{ fontWeight: 700, color: r.profit >= 0 ? "var(--ok)" : "var(--danger)" }}>{won(r.profit)}</td><td className="num">{r.margin.toFixed(1)}%</td></>}
                  <td className="num">{totRev ? ((r.rev / totRev) * 100).toFixed(1) : 0}%</td>
                  <td className="num">{num(r.qty)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ fontWeight: 700, background: "#f8f9fb" }}>
                <td>합계</td><td className="num">{won(totRev)}</td>{costReady && <><td className="num">{won(totCost)}</td><td className="num" style={{ color: "var(--ok)" }}>{won(totProfit)}</td><td className="num">{totRev ? ((totProfit / totRev) * 100).toFixed(1) : 0}%</td></>}<td className="num">100%</td><td className="num">{num(pnlRows.reduce((s, r) => s + r.qty, 0))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="panel">
          <div className="ph"><h3>월별 매출 추이</h3></div>
          <div style={{ padding: 16 }}>
            <div className="barwrap">
              {months.map(([m, v]) => (
                <div className="bar" key={m}><span className="lbl">{m}</span><span className="track"><span className="fill" style={{ width: `${(v / maxM) * 100}%` }} /></span><span className="amt">{won(v)}</span></div>
              ))}
              {months.length === 0 && <div style={{ color: "var(--sub)" }}>데이터 없음</div>}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="ph"><h3>고객 등급 분포</h3></div>
          <div style={{ padding: 16 }}>
            <div className="barwrap">
              {(["VIP", "우수", "일반"] as const).map((g) => {
                const mx = Math.max(1, grades.VIP, grades.우수, grades.일반);
                const cls = g === "VIP" ? "#16181d" : g === "우수" ? "#6b7280" : "#9aa0ac";
                return <div className="bar" key={g}><span className="lbl">{g}</span><span className="track"><span className="fill" style={{ width: `${(grades[g] / mx) * 100}%`, background: cls }} /></span><span className="amt">{num(grades[g])}명</span></div>;
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="ph"><h3>SKU별 매출 TOP 10</h3></div>
        <div className="tablewrap">
          <table className="dt">
            <thead><tr><th>#</th><th>SKU</th><th>제품명</th><th className="num">매출</th></tr></thead>
            <tbody>
              {topSku.map(([sku, amt], i) => (
                <tr key={sku}><td>{i + 1}</td><td className="mono">{sku}</td><td style={{ maxWidth: 320, overflow: "hidden", textOverflow: "ellipsis" }}>{nameMap.get(sku) ?? "-"}</td><td className="num">{won(amt)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
