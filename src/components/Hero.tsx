export default function Hero() {
  return (
    <section className="hero" id="about" aria-label="MaxImpact 웹 개발 외주팀 소개">
      <div className="hero-wave">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <linearGradient id="wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff5722" />
              <stop offset="100%" stopColor="#ffb300" />
            </linearGradient>
          </defs>
          <path
            d="M 100 20 A 80 80 0 0 1 180 100 M 100 20 A 80 80 0 0 0 20 100 M 100 180 A 80 80 0 0 0 180 100 M 100 180 A 80 80 0 0 1 20 100"
            fill="none" stroke="url(#wave-grad)" strokeWidth="1.5" strokeDasharray="2,5" opacity="0.8"
          />
          <circle cx="100" cy="100" r="60" fill="none" stroke="url(#wave-grad)" strokeWidth="0.8" opacity="0.4" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="url(#wave-grad)" strokeWidth="0.8" opacity="0.6" />
        </svg>
      </div>

      <div className="hero-inner">
        <div className="hero-eyebrow">
          <span className="pulse" />
          AI · WEB DEVELOPMENT TEAM
        </div>
        <h1>
          We build <span className="italic">products</span>
          <br />
          that <span className="underline-mark accent-word">make</span> impact.
        </h1>
        <p className="hero-sub">
          기획부터 디자인, 풀스택 개발, 배포까지 — 한 팀이 끝까지 책임지는 AI · 웹 개발팀.
          <br />
          검증된 실력으로 단순 외주가 아닌 장기 파트너가 됩니다.
        </p>
        <div className="hero-actions">
          <a href="#contact" className="btn btn-dark">
            프로젝트 시작하기
            <svg className="arrow" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="/MaxImpact_company_intro.pdf" className="btn btn-light" target="_blank" rel="noopener">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            팀 소개서 다운로드
          </a>
        </div>
      </div>
    </section>
  );
}
