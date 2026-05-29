"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Submission = {
  id: number;
  name: string;
  phone: string;
  email: string;
  project_type: string;
  description: string;
  created_at: string;
  ip?: string;
  user_agent?: string;
};

const STORAGE_KEY = "mi_admin_pw";

function formatDate(iso: string) {
  if (!iso) return "";
  const t = String(iso).replace(" ", "T");
  const d = new Date(t + (t.endsWith("Z") ? "" : "Z"));
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminPage() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [rows, setRows] = useState<Submission[]>([]);
  const [search, setSearch] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loading, setLoading] = useState(false);

  const stored = typeof window !== "undefined" ? sessionStorage.getItem(STORAGE_KEY) : null;

  const fetchSubmissions = useCallback(async (password: string) => {
    const res = await fetch("/api/submissions", { headers: { "x-admin-password": password } });
    if (res.status === 401) throw new Error("UNAUTHORIZED");
    if (!res.ok) throw new Error("SERVER");
    const data = await res.json();
    return (data.submissions || []) as Submission[];
  }, []);

  const loadAll = useCallback(async () => {
    const password = sessionStorage.getItem(STORAGE_KEY);
    if (!password) { setAuthed(false); return; }
    setLoading(true);
    try {
      const list = await fetchSubmissions(password);
      setRows(list);
      setAuthed(true);
    } catch (err) {
      const e = err as Error;
      if (e.message === "UNAUTHORIZED") {
        sessionStorage.removeItem(STORAGE_KEY);
        setAuthed(false);
        setLoginErr("비밀번호가 만료되었거나 잘못되었습니다.");
      } else {
        alert("서버 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  }, [fetchSubmissions]);

  useEffect(() => { if (stored) loadAll(); /* on mount */ }, [stored, loadAll]);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr("");
    setLoading(true);
    try {
      const list = await fetchSubmissions(pw);
      sessionStorage.setItem(STORAGE_KEY, pw);
      setRows(list);
      setAuthed(true);
    } catch (err) {
      const e = err as Error;
      setLoginErr(e.message === "UNAUTHORIZED" ? "비밀번호가 올바르지 않습니다." : "서버 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onLogout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAuthed(false);
    setPw("");
    setRows([]);
  };

  const onDelete = async (id: number) => {
    if (!confirm(`#${id} 항목을 삭제하시겠습니까?`)) return;
    const password = sessionStorage.getItem(STORAGE_KEY) || "";
    const res = await fetch(`/api/submissions/${id}`, { method: "DELETE", headers: { "x-admin-password": password } });
    if (res.ok) setRows((cur) => cur.filter((r) => r.id !== id));
    else alert("삭제에 실패했습니다.");
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.phone, r.email, r.project_type, r.description].some((v) =>
        String(v ?? "").toLowerCase().includes(q),
      ),
    );
  }, [rows, search]);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const weekAgo = now.getTime() - 7 * 24 * 3600 * 1000;
    let today = 0, week = 0;
    for (const r of rows) {
      const t = String(r.created_at || "").slice(0, 10);
      if (t === todayStr) today++;
      const d = new Date(String(r.created_at || "").replace(" ", "T"));
      if (!Number.isNaN(d.getTime()) && d.getTime() >= weekAgo) week++;
    }
    return { total: rows.length, today, week };
  }, [rows]);

  return (
    <>
      <style>{adminCss}</style>
      {!authed ? (
        <div className="login">
          <div className="login-card">
            <h2>MaxImpact Admin</h2>
            <p>견적 요청 관리</p>
            <form onSubmit={onLogin}>
              <label htmlFor="pw">비밀번호</label>
              <input id="pw" type="password" autoComplete="current-password" required value={pw} onChange={(e) => setPw(e.target.value)} />
              <button type="submit" disabled={loading}>{loading ? "확인 중..." : "로그인"}</button>
              <div className="err">{loginErr}</div>
            </form>
          </div>
        </div>
      ) : (
        <div className="dash">
          <div className="topbar">
            <div className="brand"><span className="dot" />MaxImpact Admin</div>
            <div className="top-spacer" />
            <span className="top-meta">{`업데이트 ${formatDate(new Date().toISOString().slice(0, 19))}`}</span>
            <button className="logout-btn" onClick={onLogout}>로그아웃</button>
          </div>

          <div className="inquiry-wrap">
            <div className="stats">
              <div className="stat"><div className="label">전체 요청</div><div className="value">{stats.total}</div></div>
              <div className="stat"><div className="label">오늘</div><div className="value">{stats.today}</div></div>
              <div className="stat"><div className="label">최근 7일</div><div className="value">{stats.week}</div></div>
            </div>

            <div className="toolbar">
              <input
                type="text"
                placeholder="이름·이메일·연락처·내용 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="refresh" onClick={loadAll} disabled={loading}>
                {loading ? "불러오는 중..." : "새로고침"}
              </button>
            </div>

            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>이름/회사</th><th>연락처</th><th>이메일</th>
                    <th>유형</th><th>설명</th><th>접수일</th><th />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td className="name">{r.name}</td>
                      <td>{r.phone}</td>
                      <td><a href={`mailto:${r.email}`}>{r.email}</a></td>
                      <td><span className="badge">{r.project_type}</span></td>
                      <td className="desc">{r.description}</td>
                      <td className="created">{formatDate(r.created_at)}</td>
                      <td className="actions">
                        <button className="del-btn" onClick={() => onDelete(r.id)}>삭제</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="empty">아직 접수된 요청이 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const adminCss = `
  body {
    background: #f6f7f9;
    font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', 'Helvetica Neue', Arial, sans-serif;
  }
  .login { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .login-card { background: #fff; padding: 36px 32px; border-radius: 18px; box-shadow: 0 12px 40px rgba(0,0,0,.08); width: 100%; max-width: 380px; }
  .login-card h2 { font-size: 20px; margin-bottom: 6px; }
  .login-card p { color: #6a6a6a; font-size: 13px; margin-bottom: 24px; }
  .login-card label { display: block; font-size: 12px; color: #3a3a3a; margin-bottom: 8px; font-weight: 600; }
  .login-card input { width: 100%; padding: 12px 14px; border: 1px solid #e6e7ea; border-radius: 10px; font-size: 14px; outline: none; transition: border .2s; }
  .login-card input:focus { border-color: #0a0a0a; }
  .login-card button { width: 100%; margin-top: 18px; padding: 12px 14px; background: #0a0a0a; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity .2s; }
  .login-card button:hover:enabled { opacity: .88; }
  .login-card button:disabled { opacity: .55; cursor: wait; }
  .login-card .err { color: #dc2626; font-size: 13px; margin-top: 12px; min-height: 18px; }

  .dash { display: flex; flex-direction: column; min-height: 100vh; }
  .topbar { background: #fff; border-bottom: 1px solid #e6e7ea; padding: 14px 24px; display: flex; align-items: center; gap: 18px; }
  .brand { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 16px; }
  .brand .dot { width: 8px; height: 8px; border-radius: 50%; background: #0a0a0a; }
  .top-spacer { flex: 1; }
  .top-meta { color: #6a6a6a; font-size: 12px; }
  .logout-btn { background: none; border: 1px solid #e6e7ea; padding: 7px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #6a6a6a; }
  .logout-btn:hover { color: #0a0a0a; }

  .inquiry-wrap { padding: 24px 28px 80px; max-width: 1480px; margin: 0 auto; width: 100%; }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 20px; }
  .stat { background: #fff; border-radius: 14px; padding: 18px 20px; border: 1px solid #e6e7ea; }
  .stat .label { font-size: 11px; text-transform: uppercase; color: #6a6a6a; letter-spacing: 1px; font-weight: 600; }
  .stat .value { font-size: 28px; font-weight: 800; margin-top: 6px; letter-spacing: -1px; }

  .toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
  .toolbar input { flex: 1; min-width: 200px; padding: 10px 14px; border: 1px solid #e6e7ea; border-radius: 10px; font-size: 14px; background: #fff; outline: none; }
  .toolbar input:focus { border-color: #0a0a0a; }
  .toolbar button.refresh { padding: 10px 18px; background: #0a0a0a; color: #fff; border: 1px solid #0a0a0a; border-radius: 10px; font-size: 13px; cursor: pointer; font-weight: 600; }
  .toolbar button.refresh:disabled { opacity: .55; cursor: wait; }

  .table-card { background: #fff; border-radius: 14px; border: 1px solid #e6e7ea; overflow: hidden; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 14px 16px; font-size: 13px; vertical-align: top; border-bottom: 1px solid #e6e7ea; }
  th { font-size: 11px; text-transform: uppercase; color: #6a6a6a; letter-spacing: 1px; background: #fafbfc; font-weight: 700; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #fafbfc; }
  td.desc { max-width: 380px; white-space: pre-wrap; word-break: break-word; color: #3a3a3a; }
  td.name { font-weight: 700; }
  td.created { color: #6a6a6a; font-size: 12px; white-space: nowrap; }
  td.actions { white-space: nowrap; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 99px; background: #eef0f3; font-size: 11px; font-weight: 600; color: #3a3a3a; }
  .del-btn { background: none; border: 1px solid #e6e7ea; color: #6a6a6a; padding: 6px 10px; border-radius: 8px; font-size: 12px; cursor: pointer; transition: all .15s; }
  .del-btn:hover { color: #dc2626; border-color: #dc2626; }
  .empty { padding: 60px 20px; text-align: center; color: #6a6a6a; font-size: 14px; }

  @media (max-width: 780px) {
    .topbar { padding: 10px 16px; flex-wrap: wrap; }
    .inquiry-wrap { padding: 16px 14px 60px; }
    th, td { padding: 10px 12px; font-size: 12px; }
    td.desc { max-width: 160px; }
  }
`;
