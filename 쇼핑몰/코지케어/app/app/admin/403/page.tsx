import Link from "next/link";

export default function Page() {
  return (
    <>
      <style>{`
        body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg-secondary)}
        .error-page{text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px}
        .error-code{font-family:var(--font-mono);font-size:80px;font-weight:700;color:var(--border)}
        .error-logo{font-family:'Inter',sans-serif;font-size:14px;font-weight:600;color:var(--accent);letter-spacing:0.5px}
        .error-title{font-family:'Inter',sans-serif;font-size:20px;font-weight:600;color:var(--fg-primary)}
        .error-desc{font-family:'Inter',sans-serif;font-size:14px;color:var(--fg-muted);text-align:center;line-height:1.6}
      `}</style>
      <div className="error-page">
        <div className="error-code">403</div>
        <div className="error-logo">코지케어 ADMIN</div>
        <div className="error-title">접근 권한이 없습니다</div>
        <div className="error-desc">이 페이지에 접근할 권한이 없습니다.<br />관리자에게 문의하세요.</div>
        <Link href="/admin/dashboard" className="btn btn-primary" style={{ marginTop: 8 }}><i className="icon-arrow-left" style={{ fontSize: 16 }}></i> 대시보드로 돌아가기</Link>
      </div>
    </>
  );
}
