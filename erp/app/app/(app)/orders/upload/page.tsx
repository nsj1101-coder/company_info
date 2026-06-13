import { prisma } from "@/lib/prisma";
import { num, ymd } from "@/lib/format";
import Uploader from "@/components/Uploader";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const [batches, rawCount, recent] = await Promise.all([
    prisma.uploadBatch.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.rawOrder.count(),
    prisma.rawOrder.findMany({ orderBy: { id: "desc" }, take: 20 }),
  ]);

  return (
    <>
      <div className="panel">
        <div className="ph"><h3>채널 주문 수집</h3><span className="hint">— 채널 동기화(데모) 또는 쇼핑몰 다운로드 엑셀 업로드</span></div>
        <div style={{ padding: 18 }}><Uploader /></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 18 }}>
        <div className="panel">
          <div className="ph"><h3>수집·동기화 이력</h3></div>
          <div className="tablewrap">
            <table className="dt">
              <thead><tr><th>파일</th><th>유형</th><th className="num">건수</th><th>일시</th></tr></thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.id}>
                    <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>{b.filename}</td>
                    <td><span className="badge b-info">{b.sheetType === "cafe" ? "온라인" : "오프라인"}</span></td>
                    <td className="num">{num(b.rowCount)}</td>
                    <td>{ymd(b.createdAt)}</td>
                  </tr>
                ))}
                {batches.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", padding: 24, color: "var(--sub)" }}>이력 없음</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="ph"><h3>수집된 원천 주문 <span className="hint">총 {num(rawCount)}건</span></h3></div>
          <div className="tablewrap">
            <table className="dt">
              <thead><tr><th>주문번호</th><th>몰</th><th>결제자</th><th>상품</th><th className="num">수량</th><th>상태</th></tr></thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id}>
                    <td className="mono">{r.orderNo ?? "-"}</td>
                    <td>{r.source ?? "-"}</td>
                    <td>{r.payer ?? "-"}</td>
                    <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>{r.productName ?? "-"}</td>
                    <td className="num">{num(r.qty)}</td>
                    <td><span className="badge b-gray">{r.orderStatus ?? r.shipStatus ?? "-"}</span></td>
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
