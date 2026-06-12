import { prisma } from "@/lib/prisma";
import { won, num } from "@/lib/format";
import { SearchForm, Pager } from "@/components/Toolbar";

export const dynamic = "force-dynamic";
const PER = 50;

export default async function Products({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const page = Math.max(1, Number(sp.page) || 1);
  const where = q
    ? { OR: [{ sku: { contains: q } }, { name: { contains: q } }, { category: { contains: q } }] }
    : {};
  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({ where, orderBy: { sku: "asc" }, skip: (page - 1) * PER, take: PER }),
  ]);

  return (
    <div className="panel">
      <div className="ph">
        <h3>상품 / SKU <span className="hint">총 {num(total)}개</span></h3>
        <span className="sp" />
        <SearchForm q={q} action="/products" placeholder="SKU·상품명·카테고리" />
      </div>
      <div className="tablewrap">
        <table className="dt">
          <thead><tr><th>SKU</th><th>상품명</th><th>카테고리</th><th>컬러</th><th>사이즈</th><th className="num">원가</th><th className="num">온라인가</th><th className="num">B2B가</th><th className="num">안전재고</th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="mono">{p.sku}</td>
                <td>{p.name}</td>
                <td>{p.category ?? "-"}</td>
                <td>{p.color ?? "-"}</td>
                <td>{p.size ?? "-"}</td>
                <td className="num">{p.cost ? won(p.cost) : "-"}</td>
                <td className="num">{p.priceOnline ? won(p.priceOnline) : "-"}</td>
                <td className="num">{p.priceB2B ? won(p.priceB2B) : "-"}</td>
                <td className="num">{num(p.safeStock)}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={9} style={{ textAlign: "center", padding: 30, color: "var(--sub)" }}>결과 없음</td></tr>}
          </tbody>
        </table>
      </div>
      <Pager base="/products" page={page} pages={Math.ceil(total / PER)} q={q} />
    </div>
  );
}
