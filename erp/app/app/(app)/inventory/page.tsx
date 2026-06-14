import { prisma } from "@/lib/prisma";
import { num } from "@/lib/format";
import { SearchForm, Pager } from "@/components/Toolbar";
import InventoryEdit from "@/components/InventoryEdit";

export const dynamic = "force-dynamic";
const PER = 50;

export default async function Inventory({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const page = Math.max(1, Number(sp.page) || 1);
  const where = q ? { OR: [{ sku: { contains: q } }, { productName: { contains: q } }] } : {};
  const [total, rows, ok, low, out] = await Promise.all([
    prisma.inventory.count({ where }),
    prisma.inventory.findMany({ where, orderBy: { shortageQty: "desc" }, skip: (page - 1) * PER, take: PER }),
    prisma.inventory.count({ where: { status: "정상" } }),
    prisma.inventory.count({ where: { status: "부족" } }),
    prisma.inventory.count({ where: { status: "품절" } }),
  ]);
  const badge = (s: string | null) => s === "정상" ? "b-ok" : s === "부족" ? "b-warn" : "b-danger";

  return (
    <>
      <div className="kpis">
        <div className="kpi"><div className="k">총 SKU</div><div className="v">{num(total)} <small>개</small></div></div>
        <div className="kpi ok"><div className="k">정상</div><div className="v">{num(ok)} <small>개</small></div></div>
        <div className="kpi warn"><div className="k">부족</div><div className="v">{num(low)} <small>개</small></div></div>
        <div className="kpi danger"><div className="k">품절</div><div className="v">{num(out)} <small>개</small></div></div>
      </div>
      <div className="panel">
        <div className="ph">
          <h3>재고 현황 <span className="hint">현재고 = 초기+입고−출고+반품 (자동)</span></h3>
          <span className="sp" /><SearchForm q={q} action="/inventory" placeholder="SKU·제품명" />
        </div>
        <div className="tablewrap">
          <table className="dt">
            <thead><tr><th>SKU</th><th>제품명</th><th>컬러</th><th>사이즈</th><th className="num">현재고</th><th className="num">안전재고</th><th className="num">부족</th><th className="num">권장발주</th><th>상태</th><th>조정</th></tr></thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i.id}>
                  <td className="mono">{i.sku}</td>
                  <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{i.productName ?? "-"}</td>
                  <td>{i.color ?? "-"}</td><td>{i.size ?? "-"}</td>
                  <td className="num" style={{ fontWeight: 700, color: i.currentStock <= 0 ? "var(--danger)" : i.currentStock < i.safeStock ? "var(--warn)" : "inherit" }}>{num(i.currentStock)}</td>
                  <td className="num">{num(i.safeStock)}</td>
                  <td className="num">{i.shortageQty > 0 ? num(i.shortageQty) : "-"}</td>
                  <td className="num">{i.recommendQty > 0 ? num(i.recommendQty) : "-"}</td>
                  <td><span className={"badge " + badge(i.status)}>{i.status ?? "-"}</span></td>
                  <td><InventoryEdit id={i.id} currentStock={i.currentStock} safeStock={i.safeStock} /></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={10} style={{ textAlign: "center", padding: 30, color: "var(--sub)" }}>결과 없음</td></tr>}
            </tbody>
          </table>
        </div>
        <Pager base="/inventory" page={page} pages={Math.ceil(total / PER)} q={q} />
      </div>
    </>
  );
}
