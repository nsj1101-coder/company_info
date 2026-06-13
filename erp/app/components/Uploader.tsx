"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BASE } from "@/lib/base";

type Result = { ok: boolean; inserted?: number; newCustomers?: number; sample?: { orderNo?: string; payer?: string; product?: string; qty?: number; amount?: number }[]; error?: string };

export default function Uploader() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [sheetType, setSheetType] = useState("cafe");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<Result | null>(null);

  async function upload() {
    if (!file) return;
    setBusy(true); setRes(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("sheetType", sheetType);
    const r = await fetch(`${BASE}/api/orders/upload`, { method: "POST", body: fd });
    const j: Result = await r.json();
    setBusy(false); setRes(j);
    if (j.ok) router.refresh();
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <select className="f" value={sheetType} onChange={(e) => setSheetType(e.target.value)}>
          <option value="cafe">온라인 3몰 (Cafe24·스마트스토어·자사몰)</option>
          <option value="offline">오프라인 주문서 (B2B·전화·방문)</option>
        </select>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          style={{ fontSize: 13 }} />
        <button className="btn primary" disabled={!file || busy} onClick={upload}>
          {busy ? "업로드 중…" : "업로드 & 수집"}
        </button>
      </div>
      <p style={{ fontSize: 12.5, color: "var(--sub)", marginTop: 10 }}>
        쇼핑몰 어드민에서 내려받은 주문 엑셀을 그대로 올리세요. 시스템이 자동으로 적재하고 신규 고객을 등록합니다.
      </p>

      {res && !res.ok && (
        <div style={{ marginTop: 14, padding: "10px 14px", background: "#fdecec", color: "#b03939", borderRadius: 8, fontSize: 13 }}>
          업로드 실패: {res.error === "empty" ? "유효한 주문 행이 없습니다." : res.error === "parse_failed" ? "엑셀을 읽을 수 없습니다." : res.error}
        </div>
      )}
      {res && res.ok && (
        <div style={{ marginTop: 14 }}>
          <div style={{ padding: "10px 14px", background: "#e6f4ea", color: "#137a4b", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
            {res.inserted}건 수집 완료 · 신규 고객 {res.newCustomers}명 자동등록
          </div>
          {res.sample && res.sample.length > 0 && (
            <div className="tablewrap" style={{ marginTop: 12, border: "1px solid var(--line)", borderRadius: 10 }}>
              <table className="dt">
                <thead><tr><th>주문번호</th><th>결제자</th><th>상품</th><th className="num">수량</th><th className="num">금액</th></tr></thead>
                <tbody>
                  {res.sample.map((s, i) => (
                    <tr key={i}><td className="mono">{s.orderNo ?? "-"}</td><td>{s.payer ?? "-"}</td><td>{s.product ?? "-"}</td><td className="num">{s.qty ?? "-"}</td><td className="num">{(s.amount ?? 0).toLocaleString()}원</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
