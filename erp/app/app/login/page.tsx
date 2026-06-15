"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BASE } from "@/lib/base";

export default function Login() {
  const r = useRouter();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    const res = await fetch(`${BASE}/api/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId: id, password: pw }),
    });
    setBusy(false);
    if (res.ok) r.push("/");
    else setErr("아이디 또는 비밀번호가 올바르지 않습니다.");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#fff" }}>
      {/* 좌: 로그인 폼 */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
        <form onSubmit={submit} style={{ width: "100%", maxWidth: 340 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 6px", color: "#111" }}>로그인</h1>
          <p style={{ color: "#9aa0ac", fontSize: 13, margin: "0 0 30px" }}>라린느 통합 ERP에 오신 것을 환영합니다.</p>

          <label style={{ display: "block", fontSize: 12.5, color: "#5b616e", fontWeight: 600, marginBottom: 6 }}>아이디</label>
          <input value={id} onChange={(e) => setId(e.target.value)} autoFocus
            style={{ width: "100%", padding: "12px 13px", border: "1.4px solid #e6e8ec", borderRadius: 10, fontSize: 14, marginBottom: 14, outlineColor: "#111" }} />

          <label style={{ display: "block", fontSize: 12.5, color: "#5b616e", fontWeight: 600, marginBottom: 6 }}>비밀번호</label>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
            style={{ width: "100%", padding: "12px 13px", border: "1.4px solid #e6e8ec", borderRadius: 10, fontSize: 14, outlineColor: "#111" }} />

          {err && <div style={{ marginTop: 14, padding: "9px 12px", background: "#f1f2f4", color: "#16181d", border: "1px solid #d6d8de", borderRadius: 8, fontSize: 13 }}>{err}</div>}

          <button type="submit" disabled={busy}
            style={{ width: "100%", marginTop: 24, padding: 14, background: "#111", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: busy ? "progress" : "pointer" }}>
            {busy ? "확인 중…" : "로그인"}
          </button>
        </form>
      </div>

      {/* 우: 브랜드 패널 (블랙) */}
      <div className="login-brand" style={{ flex: 1, background: "#111", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
        <div style={{ background: "#fff", borderRadius: 18, padding: "26px 34px", boxShadow: "0 20px 60px -20px rgba(0,0,0,.5)" }}>
          <img src={`${BASE}/logo.png`} alt="LALUNE" style={{ height: 26, display: "block" }} />
        </div>
        <div style={{ color: "#fff", fontWeight: 800, fontSize: 24, letterSpacing: "-0.5px" }}>통합 ERP</div>
      </div>
    </div>
  );
}
