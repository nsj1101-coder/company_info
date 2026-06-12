import Link from 'next/link';

export default function Page() {
  return (
    <>
      <style>{`
        body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg-secondary)}
        .error-page{text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px}
        .error-icon{width:64px;height:64px;border-radius:50%;background:#FFF3E0;display:flex;align-items:center;justify-content:center}
        .error-title{font-family:'Inter',sans-serif;font-size:20px;font-weight:600;color:var(--fg-primary)}
        .error-desc{font-family:'Inter',sans-serif;font-size:14px;color:var(--fg-muted);text-align:center;line-height:1.6}
      `}</style>
      <div className="error-page">
        <div className="error-icon"><i className="icon-clock" style={{ fontSize: 28, color: 'var(--warning)' }}></i></div>
        <div className="error-title">세션이 만료되었습니다</div>
        <div className="error-desc">보안을 위해 일정 시간 미활동 시 자동 로그아웃됩니다.<br />다시 로그인해주세요.</div>
        <Link href="/admin/login" className="btn btn-primary" style={{ marginTop: 8 }}><i className="icon-log-in" style={{ fontSize: 16 }}></i> 로그인 페이지로</Link>
      </div>
    </>
  );
}
