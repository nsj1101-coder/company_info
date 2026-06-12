import { prisma } from "@/lib/prisma";
import { num, ymd } from "@/lib/format";
import { SearchForm, Pager } from "@/components/Toolbar";

export const dynamic = "force-dynamic";
const PER = 50;

export default async function Production({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const page = Math.max(1, Number(sp.page) || 1);
  const where = q ? { OR: [{ prodNo: { contains: q } }, { sku: { contains: q } }, { productName: { contains: q } }, { factory: { contains: q } }] } : {};
  const [total, rows, delayed] = await Promise.all([
    prisma.productionOrder.count({ where }),
    prisma.productionOrder.findMany({ where, orderBy: { prodDate: "desc" }, skip: (page - 1) * PER, take: PER }),
    prisma.productionOrder.count({ where: { delayed: { contains: "지연" } } }),
  ]);

  return (
    <>
      <div className="kpis">
        <div className="kpi"><div className="k">총 생산건</div><div className="v">{num(total)} <small>건</small></div></div>
        <div className="kpi danger"><div className="k">지연</div><div className="v">{num(delayed)} <small>건</small></div></div>
        <div className="kpi"><div className="k">본공장</div><div className="v">{num(await prisma.productionOrder.count({ where: { factory: { contains: "본" } } }))} <small>건</small></div></div>
        <div className="kpi"><div className="k">외주</div><div className="v">{num(await prisma.productionOrder.count({ where: { factory: { contains: "외주" } } }))} <small>건</small></div></div>
      </div>
      <div className="panel">
        <div className="ph"><h3>생산 관리 <span className="hint">총 {num(total)}건</span></h3><span className="sp" /><SearchForm q={q} action="/production" placeholder="생산번호·SKU·공장" /></div>
        <div className="tablewrap">
          <table className="dt">
            <thead><tr><th>생산번호</th><th>생산일</th><th>SKU</th><th>제품</th><th className="num">주문</th><th className="num">생산</th><th className="num">불량</th><th className="num">입고</th><th>공장</th><th>대표확인</th><th>지연</th></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td className="mono">{p.prodNo}</td><td>{ymd(p.prodDate)}</td>
                  <td className="mono">{p.sku ?? "-"}</td>
                  <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>{p.productName ?? "-"}</td>
                  <td className="num">{num(p.orderQty)}</td><td className="num">{num(p.prodQty)}</td>
                  <td className="num" style={{ color: p.defectQty > 0 ? "var(--danger)" : "inherit" }}>{num(p.defectQty)}</td>
                  <td className="num">{num(p.inboundQty)}</td>
                  <td>{p.factory ?? "-"}</td>
                  <td>{p.ceoConfirm ? <span className="badge b-ok">{p.ceoConfirm}</span> : "-"}</td>
                  <td>{p.delayed?.includes("지연") ? <span className="badge b-danger">지연</span> : <span className="badge b-gray">정상</span>}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={11} style={{ textAlign: "center", padding: 30, color: "var(--sub)" }}>결과 없음</td></tr>}
            </tbody>
          </table>
        </div>
        <Pager base="/production" page={page} pages={Math.ceil(total / PER)} q={q} />
      </div>
    </>
  );
}
