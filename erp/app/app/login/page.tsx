"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const r = useRouter();
  const [id, setId] = useState("admin");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setBusy(true);
    const res = await fetch("/api/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginId: id, password: pw }),
    });
    setBusy(false);
    if (res.ok) r.push("/");
    else setErr("아이디 또는 비밀번호가 올바르지 않습니다.");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <form onSubmit={submit} style={{ width: 380, background: "#fff", borderRadius: 16, padding: "38px 34px", border: "1px solid var(--line)", boxShadow: "0 24px 50px -28px rgba(47,58,143,.3)" }}>
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>
          <span style={{ background: "var(--brand)", color: "#fff", borderRadius: 6, padding: "2px 9px", fontSize: 15 }}>LALUNE</span> 통합 ERP
        </div>
        <p style={{ color: "var(--sub)", fontSize: 13, margin: "8px 0 24px" }}>의류 제조·유통 통합 업무 시스템</p>
        <label style={{ fontSize: 12.5, color: "var(--sub)", fontWeight: 600 }}>아이디</label>
        <input className="f" value={id} onChange={(e) => setId(e.target.value)} style={{ width: "100%", marginTop: 6, marginBottom: 14 }} autoFocus />
        <label style={{ fontSize: 12.5, color: "var(--sub)", fontWeight: 600 }}>비밀번호</label>
        <input className="f" type="password" value={pw} onChange={(e) => setPw(e.target.value)} style={{ width: "100%", marginTop: 6 }} />
        {err && <div style={{ marginTop: 14, padding: "9px 12px", background: "#fdecec", color: "#b03939", borderRadius: 8, fontSize: 13 }}>{err}</div>}
        <button className="btn primary" disabled={busy} style={{ width: "100%", marginTop: 22, justifyContent: "center", padding: 13 }}>
          {busy ? "확인 중…" : "로그인"}
        </button>
        <p style={{ marginTop: 18, fontSize: 12, color: "var(--sub)", textAlign: "center" }}>데모 계정: admin / admin1234</p>
      </form>
    </div>
  );
}
