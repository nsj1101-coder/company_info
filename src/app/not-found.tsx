import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 — 페이지를 찾을 수 없습니다",
  description: "요청하신 페이지를 찾을 수 없습니다. MaxImpact 메인 페이지로 돌아가 웹 개발, 쇼핑몰 제작, AI SaaS 개발 서비스를 확인해보세요.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/" },
};

export default function NotFound() {
  return (
    <>
      <style>{`
        body {
          background:
            radial-gradient(800px 500px at 20% 20%, rgba(255,87,34,0.08), transparent 60%),
            radial-gradient(700px 500px at 80% 80%, rgba(255,138,76,0.06), transparent 60%),
            var(--bg);
          display: flex; flex-direction: column; min-height: 100vh; overflow-x: hidden;
        }
        .nf-top { padding: 28px 40px; }
        .nf-main { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 32px 80px; }
        .nf-inner { max-width: 760px; text-align: center; animation: nf-fadeUp .8s cubic-bezier(0.16,1,0.3,1); }
        @keyframes nf-fadeUp { from { opacity: 0; transform: translateY(20px);} to { opacity: 1; transform: translateY(0);} }
        .nf-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px; border-radius: 100px;
          background: rgba(255,87,34,0.08);
          border: 1px solid rgba(255,87,34,0.25);
          color: var(--accent);
          font-family: 'Manrope', sans-serif;
          font-size: 11.5px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; margin-bottom: 24px;
        }
        .nf-eyebrow .pulse {
          width: 6px; height: 6px; border-radius: 50%; background: var(--accent);
          animation: nf-pulse 1.6s ease-in-out infinite;
        }
        @keyframes nf-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.55; }
        }
        .nf-big {
          font-family: 'Manrope', 'Inter', sans-serif;
          font-weight: 800; font-size: clamp(96px, 22vw, 220px);
          line-height: 0.95; letter-spacing: -6px;
          background: linear-gradient(135deg, var(--ink) 0%, var(--accent) 60%, var(--accent-2) 100%);
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
          margin-bottom: 24px;
        }
        .nf-title {
          font-family: 'Inter', 'Pretendard', sans-serif;
          font-size: clamp(26px, 4vw, 38px); font-weight: 700; letter-spacing: -1px;
          color: var(--ink); margin-bottom: 14px;
        }
        .nf-title .italic { font-style: italic; font-weight: 400; color: var(--ink-4); }
        .nf-lead { font-size: 16px; color: var(--ink-3); line-height: 1.7; max-width: 520px; margin: 0 auto 36px; }
        .nf-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .nf-suggest { margin-top: 64px; padding-top: 32px; border-top: 1px solid var(--line); }
        .nf-suggest h2 {
          font-family: 'Manrope', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 1.5px;
          text-transform: uppercase; color: var(--ink-4); margin-bottom: 18px;
        }
        .nf-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 10px;
        }
        .nf-grid a {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 18px; border: 1px solid var(--line); border-radius: 14px;
          font-size: 14px; color: var(--ink-2); font-weight: 500; background: #fff;
          transition: border-color .2s, transform .2s, background .25s;
        }
        .nf-grid a:hover { border-color: var(--ink); transform: translateY(-2px); background: var(--bg-soft); }
        .nf-grid a .arrow { color: var(--ink-5); }
        .nf-grid a:hover .arrow { color: var(--accent); }
        .nf-footer {
          padding: 24px 40px; border-top: 1px solid var(--line);
          font-size: 12px; color: var(--ink-5);
          font-family: 'Manrope', sans-serif; font-weight: 500;
          display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;
        }
        @media (max-width: 640px) {
          .nf-top { padding: 20px 24px; }
          .nf-main { padding: 20px 20px 60px; }
          .nf-footer { padding: 20px 24px; flex-direction: column; align-items: flex-start; }
        }
      `}</style>
      <div className="nf-top">
        <a href="/" className="brand" aria-label="MaxImpact 홈으로 이동">
          <span className="brand-dot" />
          MaxImpact
        </a>
      </div>
      <main className="nf-main">
        <div className="nf-inner">
          <div className="nf-eyebrow">
            <span className="pulse" />
            ERROR 404 · PAGE NOT FOUND
          </div>
          <div className="nf-big" aria-hidden="true">404</div>
          <h2 className="nf-title">
            요청하신 페이지를 <span className="italic">찾을 수 없습니다.</span>
          </h2>
          <p className="nf-lead">
            주소가 잘못 입력되었거나, 페이지가 삭제·이동되었을 수 있습니다.
            <br />홈으로 돌아가 MaxImpact의 서비스를 확인해보세요.
          </p>
          <div className="nf-actions">
            <a href="/" className="btn btn-dark" aria-label="홈으로 가기">
              홈으로 가기
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="/#contact" className="btn btn-light" aria-label="프로젝트 문의하기">
              프로젝트 문의
            </a>
          </div>

          <div className="nf-suggest">
            <h2>이런 페이지는 어떠세요?</h2>
            <div className="nf-grid">
              <a href="/#services"><span>서비스 소개</span><span className="arrow">→</span></a>
              <a href="/#portfolio"><span>포트폴리오</span><span className="arrow">→</span></a>
              <a href="/#team"><span>팀 소개</span><span className="arrow">→</span></a>
              <a href="/#contact"><span>견적 문의</span><span className="arrow">→</span></a>
            </div>
          </div>
        </div>
      </main>
      <footer className="nf-footer">
        <div>© 2026 MaxImpact. All rights reserved.</div>
        <div>AI · Web Development Team · Seoul, KR</div>
      </footer>
    </>
  );
}
