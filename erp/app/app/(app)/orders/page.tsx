import { prisma } from "@/lib/prisma";
import { won, num, ymd } from "@/lib/format";
import { Pager } from "@/components/Toolbar";
import { StatusBadge } from "../page";
import OrderActions from "@/components/OrderActions";
import Link from "next/link";

export const dynamic = "force-dynamic";
const PER = 50;

export default async function Orders({ searchParams }: { searchParams: Promise<{ q?: string; channel?: string; status?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() || "";
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Record<string, unknown> = {};
  if (q) where.OR = [{ orderNo: { contains: q } }, { customerName: { contains: q } }, { productName: { contains: q } }, { sku: { contains: q } }];
  if (sp.channel) where.channel = sp.channel;
  if (sp.status) where.status = sp.status;

  const [total, rows, channels, statuses] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({ where, orderBy: { orderDate: "desc" }, skip: (page - 1) * PER, take: PER }),
    prisma.order.groupBy({ by: ["channel"] }),
    prisma.order.groupBy({ by: ["status"] }),
  ]);

  const chips = (param: "channel" | "status", vals: (string | null)[], cur?: string) => (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      <FilterChip label="전체" href={buildQs(sp, param, undefined)} on={!cur} />
      {vals.filter(Boolean).map((v) => (
        <FilterChip key={v} label={v!} href={buildQs(sp, param, v!)} on={cur === v} />
      ))}
    </div>
  );

  return (
    <div className="panel">
      <div className="ph" style={{ flexWrap: "wrap", gap: 10 }}>
        <h3>통합 주문 <span className="hint">총 {num(total)}건</span></h3>
        <span className="sp" />
        <form action="/orders" method="get" style={{ display: "flex", gap: 8 }}>
          {sp.channel && <input type="hidden" name="channel" value={sp.channel} />}
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          <input className="f" name="q" defaultValue={q} placeholder="주문번호·고객·상품·SKU" style={{ width: 240 }} />
          <button className="btn ghost">검색</button>
        </form>
      </div>
      <div style={{ padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}><span style={{ fontSize: 12, color: "var(--sub)", width: 40 }}>채널</span>{chips("channel", channels.map((c) => c.channel), sp.channel)}</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}><span style={{ fontSize: 12, color: "var(--sub)", width: 40 }}>상태</span>{chips("status", statuses.map((s) => s.status), sp.status)}</div>
      </div>
      <div className="tablewrap">
        <table className="dt">
          <thead><tr><th>주문번호</th><th>일자</th><th>채널</th><th>고객</th><th>상품</th><th className="num">수량</th><th className="num">단가</th><th className="num">금액</th><th>상태</th><th>처리</th></tr></thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td className="mono">{o.orderNo}</td>
                <td>{ymd(o.orderDate)}</td>
                <td><span className="badge b-info">{o.channel ?? "-"}</span></td>
                <td>{o.customerName ?? o.customerCode ?? "-"}</td>
                <td style={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis" }}>{o.productName ?? o.sku ?? "-"}</td>
                <td className="num">{num(o.qty)}</td>
                <td className="num">{won(o.unitPrice)}</td>
                <td className="num">{won(o.totalAmount)}</td>
                <td><StatusBadge s={o.status} /></td>
                <td><OrderActions id={o.id} status={o.status} /></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={10} style={{ textAlign: "center", padding: 30, color: "var(--sub)" }}>결과 없음</td></tr>}
          </tbody>
        </table>
      </div>
      <Pager base="/orders" page={page} pages={Math.ceil(total / PER)} q={q} extra={{ channel: sp.channel, status: sp.status }} />
    </div>
  );
}

function FilterChip({ label, href, on }: { label: string; href: string; on?: boolean }) {
  return <Link href={href} className={"badge " + (on ? "b-info" : "b-gray")} style={{ textDecoration: "none", padding: "4px 11px" }}>{label}</Link>;
}

function buildQs(sp: Record<string, string | undefined>, key: string, val: string | undefined) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v && k !== "page" && k !== key) p.set(k, v);
  if (val) p.set(key, val);
  const s = p.toString();
  return "/orders" + (s ? "?" + s : "");
}
