import { prisma } from "@/lib/prisma";
import { num, won } from "@/lib/format";
import { SearchForm, Pager } from "@/components/Toolbar";

export const dynamic = "force-dynamic";
const PER = 50;

export default async function Customers({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const page = Math.max(1, Number(sp.page) || 1);
  const where = q ? { OR: [{ code: { contains: q } }, { name: { contains: q } }, { type: { contains: q } }] } : {};
  const [total, rows] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({ where, orderBy: { code: "asc" }, skip: (page - 1) * PER, take: PER }),
  ]);
  // 고객별 누적매출 (등급 산정) — 현재 페이지 고객만 집계
  const codes = rows.map((c) => c.code);
  const sums = await prisma.order.groupBy({ by: ["customerCode"], where: { customerCode: { in: codes } }, _sum: { totalAmount: true }, _count: true });
  const sm = new Map(sums.map((s) => [s.customerCode, { amt: s._sum.totalAmount ?? 0, cnt: s._count }]));
  const grade = (a: number) => (a >= 5000000 ? ["VIP", "b-danger"] : a >= 1000000 ? ["우수", "b-warn"] : a > 0 ? ["일반", "b-info"] : ["신규", "b-gray"]);

  return (
    <div className="panel">
      <div className="ph">
        <h3>고객 관리 <span className="hint">총 {num(total)}명 · VIP=누적 500만↑</span></h3>
        <span className="sp" />
        <SearchForm q={q} action="/customers" placeholder="코드·고객명·유형" />
      </div>
      <div className="tablewrap">
        <table className="dt">
          <thead><tr><th>코드</th><th>고객명</th><th>유형</th><th>채널</th><th>담당자</th><th>연락처</th><th>지역</th><th className="num">누적매출</th><th className="num">주문수</th><th>등급</th></tr></thead>
          <tbody>
            {rows.map((c) => {
              const s = sm.get(c.code) ?? { amt: 0, cnt: 0 };
              const [g, cls] = grade(s.amt);
              return (
                <tr key={c.id}>
                  <td className="mono">{c.code}</td><td>{c.name}</td><td>{c.type ?? "-"}</td>
                  <td>{c.channel ?? "-"}</td><td>{c.manager ?? "-"}</td><td>{c.phone ?? "-"}</td><td>{c.region ?? "-"}</td>
                  <td className="num">{won(s.amt)}</td><td className="num">{num(s.cnt)}</td>
                  <td><span className={"badge " + cls}>{g}</span></td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={10} style={{ textAlign: "center", padding: 30, color: "var(--sub)" }}>결과 없음</td></tr>}
          </tbody>
        </table>
      </div>
      <Pager base="/customers" page={page} pages={Math.ceil(total / PER)} q={q} />
    </div>
  );
}
