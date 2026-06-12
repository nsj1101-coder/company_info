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

function toDate(iso: string) {
  const t = String(iso || "").replace(" ", "T");
  const d = new Date(t + (t.endsWith("Z") ? "" : "Z"));
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function AdminPage() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [rows, setRows] = useState<Submission[]>([]);
  const [search, setSearch] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"dashboard" | "list">("dashboard");

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
    const monthAgo = now.getTime() - 30 * 24 * 3600 * 1000;
    let today = 0, week = 0, month = 0;
    for (const r of rows) {
      const d = toDate(r.created_at);
      if (!d) continue;
      const t = d.toISOString().slice(0, 10);
      if (t === todayStr) today++;
      if (d.getTime() >= weekAgo) week++;
      if (d.getTime() >= monthAgo) month++;
    }
    const dailyAvg = month > 0 ? +(month / 30).toFixed(1) : 0;
    return { total: rows.length, today, week, month, dailyAvg };
  }, [rows]);

  const dailySeries = useMemo(() => {
    const days: { label: string; key: string; count: number }[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
      const key = d.toISOString().slice(0, 10);
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      days.push({ label, key, count: 0 });
    }
    for (const r of rows) {
      const d = toDate(r.created_at);
      if (!d) continue;
      const key = d.toISOString().slice(0, 10);
      const bucket = days.find((x) => x.key === key);
      if (bucket) bucket.count++;
    }
    return days;
  }, [rows]);

  const typeBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const k = (r.project_type || "기타").trim() || "기타";
      map.set(k, (map.get(k) || 0) + 1);
    }
    const arr = [...map.entries()].sort((a, b) => b[1] - a[1]);
    const max = arr[0]?.[1] || 1;
    return arr.map(([type, count]) => ({ type, count, pct: (count / max) * 100 }));
  }, [rows]);

  const hourBreakdown = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    for (const r of rows) {
      const d = toDate(r.created_at);
      if (!d) continue;
      hours[d.getHours()].count++;
    }
    const max = Math.max(1, ...hours.map((h) => h.count));
    return hours.map((h) => ({ ...h, pct: (h.count / max) * 100 }));
  }, [rows]);

  const weekdayBreakdown = useMemo(() => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    const arr = days.map((d) => ({ day: d, count: 0 }));
    for (const r of rows) {
      const d = toDate(r.created_at);
      if (!d) continue;
      arr[d.getDay()].count++;
    }
    const max = Math.max(1, ...arr.map((d) => d.count));
    return arr.map((d) => ({ ...d, pct: (d.count / max) * 100 }));
  }, [rows]);

  const recent5 = useMemo(() => {
    return [...rows]
      .sort((a, b) => (toDate(b.created_at)?.getTime() || 0) - (toDate(a.created_at)?.getTime() || 0))
      .slice(0, 5);
  }, [rows]);

  const dailyMax = Math.max(1, ...dailySeries.map((d) => d.count));

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
            <nav className="tabs">
              <button className={tab === "dashboard" ? "tab active" : "tab"} onClick={() => setTab("dashboard")}>대시보드</button>
              <button className={tab === "list" ? "tab active" : "tab"} onClick={() => setTab("list")}>견적 요청 목록</button>
            </nav>
            <div className="top-spacer" />
            <span className="top-meta">{`업데이트 ${formatDate(new Date().toISOString().slice(0, 19))}`}</span>
            <button className="refresh-btn" onClick={loadAll} disabled={loading} title="새로고침">{loading ? "..." : "↻"}</button>
            <button className="logout-btn" onClick={onLogout}>로그아웃</button>
          </div>

          {tab === "dashboard" && (
            <div className="inquiry-wrap">
              <div className="stats stats-5">
                <div className="stat"><div className="label">전체 요청</div><div className="value">{stats.total}</div></div>
                <div className="stat accent"><div className="label">오늘</div><div className="value">{stats.today}</div></div>
                <div className="stat"><div className="label">최근 7일</div><div className="value">{stats.week}</div></div>
                <div className="stat"><div className="label">최근 30일</div><div className="value">{stats.month}</div></div>
                <div className="stat"><div className="label">일평균 (30일)</div><div className="value">{stats.dailyAvg}</div></div>
              </div>

              <div className="card chart-card">
                <div className="card-head">
                  <h3>일별 견적 요청 추이 <span className="muted">(최근 30일)</span></h3>
                </div>
                <div className="bar-chart">
                  {dailySeries.map((d, i) => (
                    <div className="bar-col" key={i} title={`${d.label}: ${d.count}건`}>
                      <div className="bar-fill" style={{ height: `${(d.count / dailyMax) * 100}%` }}>
                        {d.count > 0 && <span className="bar-num">{d.count}</span>}
                      </div>
                      <span className="bar-label">{i % 3 === 0 ? d.label : ""}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid-2">
                <div className="card">
                  <div className="card-head"><h3>프로젝트 유형 분포</h3></div>
                  <div className="type-list">
                    {typeBreakdown.length === 0 && <div className="empty-mini">데이터 없음</div>}
                    {typeBreakdown.map(({ type, count, pct }) => (
                      <div className="type-row" key={type}>
                        <div className="type-meta">
                          <span className="type-name">{type}</span>
                          <span className="type-count">{count}건</span>
                        </div>
                        <div className="type-bar"><div className="type-bar-fill" style={{ width: `${pct}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div className="card-head"><h3>요일별 분포</h3></div>
                  <div className="weekday-chart">
                    {weekdayBreakdown.map((d) => (
                      <div className="weekday-col" key={d.day}>
                        <div className="weekday-bar-wrap">
                          <div className="weekday-bar" style={{ height: `${d.pct}%` }} />
                        </div>
                        <span className="weekday-num">{d.count}</span>
                        <span className="weekday-label">{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-head"><h3>시간대별 분포 <span className="muted">(0~23시)</span></h3></div>
                <div className="hour-chart">
                  {hourBreakdown.map((h) => (
                    <div className="hour-col" key={h.hour} title={`${h.hour}시: ${h.count}건`}>
                      <div className="hour-bar-wrap">
                        <div className="hour-bar" style={{ height: `${h.pct}%` }} />
                      </div>
                      <span className="hour-label">{h.hour}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-head"><h3>최근 견적 요청 <span className="muted">(5건)</span></h3></div>
                <div className="recent-list">
                  {recent5.length === 0 && <div className="empty-mini">아직 접수된 요청이 없습니다.</div>}
                  {recent5.map((r) => (
                    <div className="recent-row" key={r.id}>
                      <div className="recent-meta">
                        <span className="recent-name">{r.name}</span>
                        <span className="badge">{r.project_type}</span>
                      </div>
                      <div className="recent-desc">{r.description}</div>
                      <div className="recent-time">{formatDate(r.created_at)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "list" && (
            <div className="inquiry-wrap">
              <div className="toolbar">
                <input
                  type="text"
                  placeholder="이름·이메일·연락처·내용 검색"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <span className="result-count">{filtered.length} / {rows.length}건</span>
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
          )}
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
  .topbar { background: #fff; border-bottom: 1px solid #e6e7ea; padding: 12px 24px; display: flex; align-items: center; gap: 14px; }
  .brand { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 16px; }
  .brand .dot { width: 8px; height: 8px; border-radius: 50%; background: #0a0a0a; }
  .tabs { display: flex; gap: 4px; }
  .tab { background: none; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #6a6a6a; font-weight: 600; }
  .tab:hover { color: #0a0a0a; background: #f3f4f6; }
  .tab.active { color: #0a0a0a; background: #eef0f3; }
  .top-spacer { flex: 1; }
  .top-meta { color: #6a6a6a; font-size: 12px; }
  .refresh-btn { background: #f3f4f6; border: 1px solid #e6e7ea; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; font-size: 14px; color: #3a3a3a; }
  .refresh-btn:hover { background: #e6e7ea; }
  .refresh-btn:disabled { opacity: .55; cursor: wait; }
  .logout-btn { background: none; border: 1px solid #e6e7ea; padding: 7px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; color: #6a6a6a; }
  .logout-btn:hover { color: #0a0a0a; }

  .inquiry-wrap { padding: 24px 28px 80px; max-width: 1480px; margin: 0 auto; width: 100%; }
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 20px; }
  .stats-5 { grid-template-columns: repeat(5, 1fr); }
  .stat { background: #fff; border-radius: 14px; padding: 18px 20px; border: 1px solid #e6e7ea; }
  .stat.accent { background: #0a0a0a; color: #fff; border-color: #0a0a0a; }
  .stat.accent .label { color: rgba(255,255,255,.7); }
  .stat .label { font-size: 11px; text-transform: uppercase; color: #6a6a6a; letter-spacing: 1px; font-weight: 600; }
  .stat .value { font-size: 28px; font-weight: 800; margin-top: 6px; letter-spacing: -1px; }

  .card { background: #fff; border-radius: 14px; border: 1px solid #e6e7ea; padding: 20px 22px; margin-bottom: 16px; }
  .card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .card-head h3 { font-size: 14px; font-weight: 700; color: #0a0a0a; }
  .card-head .muted { font-weight: 400; color: #9aa0a6; font-size: 12px; margin-left: 4px; }

  .chart-card { padding-bottom: 28px; }
  .bar-chart { display: flex; align-items: flex-end; gap: 4px; height: 160px; padding: 12px 0 0; }
  .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; min-width: 0; }
  .bar-fill { width: 100%; background: linear-gradient(180deg, #0a0a0a, #3a3a3a); border-radius: 4px 4px 0 0; position: relative; min-height: 2px; max-width: 28px; margin: 0 auto; transition: opacity .15s; }
  .bar-fill:hover { opacity: .75; }
  .bar-num { position: absolute; top: -16px; left: 50%; transform: translateX(-50%); font-size: 10px; color: #6a6a6a; font-weight: 700; }
  .bar-label { font-size: 10px; color: #9aa0a6; height: 12px; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }

  .type-list { display: flex; flex-direction: column; gap: 12px; }
  .type-row { display: flex; flex-direction: column; gap: 4px; }
  .type-meta { display: flex; justify-content: space-between; align-items: center; }
  .type-name { font-size: 13px; font-weight: 600; color: #3a3a3a; }
  .type-count { font-size: 12px; color: #6a6a6a; font-weight: 600; }
  .type-bar { background: #f3f4f6; height: 8px; border-radius: 99px; overflow: hidden; }
  .type-bar-fill { background: linear-gradient(90deg, #0a0a0a, #3a3a3a); height: 100%; border-radius: 99px; transition: width .3s; }

  .weekday-chart { display: flex; gap: 8px; height: 140px; align-items: flex-end; }
  .weekday-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .weekday-bar-wrap { width: 100%; flex: 1; display: flex; align-items: flex-end; justify-content: center; }
  .weekday-bar { width: 60%; background: linear-gradient(180deg, #0a0a0a, #3a3a3a); border-radius: 4px 4px 0 0; min-height: 2px; }
  .weekday-num { font-size: 11px; color: #3a3a3a; font-weight: 700; }
  .weekday-label { font-size: 11px; color: #6a6a6a; font-weight: 600; }

  .hour-chart { display: flex; gap: 2px; height: 100px; align-items: flex-end; }
  .hour-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 0; }
  .hour-bar-wrap { width: 100%; flex: 1; display: flex; align-items: flex-end; justify-content: center; }
  .hour-bar { width: 70%; background: linear-gradient(180deg, #0a0a0a, #3a3a3a); border-radius: 3px 3px 0 0; min-height: 1px; }
  .hour-label { font-size: 9px; color: #9aa0a6; }

  .recent-list { display: flex; flex-direction: column; gap: 10px; }
  .recent-row { padding: 12px 14px; border-radius: 10px; border: 1px solid #e6e7ea; background: #fafbfc; }
  .recent-row:hover { background: #f3f4f6; }
  .recent-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
  .recent-name { font-weight: 700; font-size: 14px; }
  .recent-desc { font-size: 12px; color: #3a3a3a; margin-bottom: 6px; max-height: 36px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .recent-time { font-size: 11px; color: #6a6a6a; }
  .empty-mini { padding: 24px 0; text-align: center; color: #9aa0a6; font-size: 13px; }

  .toolbar { display: flex; gap: 10px; align-items: center; margin-bottom: 14px; flex-wrap: wrap; }
  .toolbar input { flex: 1; min-width: 200px; padding: 10px 14px; border: 1px solid #e6e7ea; border-radius: 10px; font-size: 14px; background: #fff; outline: none; }
  .toolbar input:focus { border-color: #0a0a0a; }
  .result-count { font-size: 12px; color: #6a6a6a; font-weight: 600; }

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

  @media (max-width: 980px) {
    .grid-2 { grid-template-columns: 1fr; }
    .stats-5 { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 780px) {
    .topbar { padding: 10px 16px; flex-wrap: wrap; }
    .inquiry-wrap { padding: 16px 14px 60px; }
    th, td { padding: 10px 12px; font-size: 12px; }
    td.desc { max-width: 160px; }
    .stats-5 { grid-template-columns: repeat(2, 1fr); }
  }
`;
