"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BASE } from "@/lib/base";

type UpResult = { ok: boolean; inserted?: number; newCustomers?: number; sample?: { orderNo?: string; payer?: string; product?: string; qty?: number; amount?: number }[]; error?: string };
type SyncRow = { orderNo: string; product: string; qty: number; amount: number; status: string };
type SyncResult = { ok: boolean; channel?: string; inserted?: number; sample?: SyncRow[]; customer?: { name: string; code: string; cumulative: number; grade: string }; error?: string };

const CHANNELS = [
  { key: "cafe24", label: "Cafe24" },
  { key: "smartstore", label: "스마트스토어" },
  { key: "mall", label: "자사몰" },
];

export default function Uploader() {
  const router = useRouter();
  // 동기화
  const [syncing, setSyncing] = useState<string | null>(null);
  const [sync, setSync] = useState<SyncResult | null>(null);
  // 엑셀 업로드
  const [file, setFile] = useState<File | null>(null);
  const [sheetType, setSheetType] = useState("cafe");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<UpResult | null>(null);

  async function doSync(channel: string) {
    setSyncing(channel); setSync(null);
    const r = await fetch(`${BASE}/api/orders/sync`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel }),
    });
    const j: SyncResult = await r.json();
    setSyncing(null); setSync(j);
    if (j.ok) router.refresh();
  }

  async function upload() {
    if (!file) return;
    setBusy(true); setRes(null);
    const fd = new FormData();
    fd.append("file", file); fd.append("sheetType", sheetType);
    const r = await fetch(`${BASE}/api/orders/upload`, { method: "POST", body: fd });
    const j: UpResult = await r.json();
    setBusy(false); setRes(j);
    if (j.ok) router.refresh();
  }

  return (
    <div>
      {/* ── 채널 동기화 (데모) ── */}
      <div style={{ marginBottom: 22, padding: 16, border: "1px solid var(--line)", borderRadius: 12, background: "var(--brand-50)" }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>채널 자동 동기화</div>
        <div style={{ fontSize: 12.5, color: "var(--warn)", background: "#fef6e7", padding: "8px 12px", borderRadius: 8, marginBottom: 12 }}>
          ※ 데모 사이트이므로 실제 API 통신은 되지 않습니다. 데이터 동기화 테스트 시나리오를 보기 위한 버튼입니다.
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {CHANNELS.map((c) => (
            <button key={c.key} className="btn primary" disabled={!!syncing} onClick={() => doSync(c.key)}>
              {syncing === c.key ? "동기화 중…" : `${c.label} 동기화`}
            </button>
          ))}
        </div>

        {sync && !sync.ok && (
          <div style={{ marginTop: 12, padding: "9px 13px", background: "#fdecec", color: "#b03939", borderRadius: 8, fontSize: 13 }}>동기화 실패: {sync.error}</div>
        )}
        {sync && sync.ok && (
          <div style={{ marginTop: 12 }}>
            <div style={{ padding: "9px 13px", background: "#e6f4ea", color: "#137a4b", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
              {sync.channel}에서 {sync.inserted}건 동기화 완료 · 고객 노성준({sync.customer?.code}) 누적 {sync.customer?.cumulative.toLocaleString()}원 → 등급 {sync.customer?.grade}
            </div>
            <div className="tablewrap" style={{ marginTop: 10, border: "1px solid var(--line)", borderRadius: 10 }}>
              <table className="dt">
                <thead><tr><th>주문번호</th><th>상품</th><th className="num">수량</th><th className="num">금액</th><th>상태</th></tr></thead>
                <tbody>
                  {sync.sample?.map((s) => (
                    <tr key={s.orderNo}>
                      <td className="mono">{s.orderNo}</td><td>{s.product}</td>
                      <td className="num">{s.qty}</td><td className="num">{s.amount.toLocaleString()}원</td>
                      <td><span className="badge b-info">{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── 엑셀 업로드 ── */}
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>엑셀 업로드</div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <a className="btn ghost" href={`${BASE}/api/orders/template`} download style={{ textDecoration: "none" }}>
          ⬇ Cafe24 엑셀 양식 다운로드
        </a>
        <span style={{ width: 1, height: 24, background: "var(--line)" }} />
        <select className="f" value={sheetType} onChange={(e) => setSheetType(e.target.value)}>
          <option value="cafe">온라인 주문 (쇼핑몰 다운로드 파일)</option>
          <option value="offline">오프라인 주문서 (B2B·전화·방문)</option>
        </select>
        <input className="fileinput" type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
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
