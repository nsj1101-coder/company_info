export default function Cta() {
  return (
    <section style={{ paddingTop: 0, paddingBottom: 140 }}>
      <div className="cta-banner reveal">
        <svg className="cta-bg" viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            <linearGradient id="cta-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff5722" />
              <stop offset="100%" stopColor="#ffb300" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="80" fill="none" stroke="url(#cta-grad)" strokeWidth="1.5" strokeDasharray="3,6" />
          <circle cx="100" cy="100" r="55" fill="none" stroke="url(#cta-grad)" strokeWidth="1" strokeDasharray="2,4" />
          <circle cx="100" cy="100" r="30" fill="url(#cta-grad)" opacity="0.3" />
        </svg>
        <h2>
          Ready to build<br />
          something <span className="italic accent-word">remarkable</span>?
        </h2>
        <p>지금 이 순간에도 새로운 프로젝트가 진행되고 있습니다. 다음 성공 사례의 주인공이 되어 주세요.</p>
        <div className="cta-actions">
          <a href="#contact" className="btn btn-dark">
            무료 견적 받기
            <svg className="arrow" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="mailto:maximpact.it@gmail.com" className="btn btn-light">이메일 보내기</a>
        </div>
      </div>
    </section>
  );
}
