export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand-col">
          <a href="#" className="brand">
            <span className="brand-dot" />
            MaxImpact
          </a>
          <p>
            AI · 웹 개발 전문 팀.<br />
            최적의 효율로 최고의 가치를 보여드립니다.<br />
            기획부터 배포까지 한 팀이 끝까지 책임집니다.
          </p>
        </div>
        <div className="footer-col">
          <h5>Services</h5>
          <ul>
            <li><a href="#services">ERP / CRM</a></li>
            <li><a href="#services">쇼핑몰</a></li>
            <li><a href="#services">AI / SaaS</a></li>
            <li><a href="#services">네이티브 앱</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Company</h5>
          <ul>
            <li><a href="#about">About</a></li>
            <li><a href="#portfolio">Portfolio</a></li>
            <li><a href="#team">Team</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h5>Contact</h5>
          <ul>
            <li>maximpact.it@gmail.com</li>
            <li>KakaoTalk: max-impact</li>
          </ul>
        </div>
      </div>

      <div className="footer-seo">
        <h6>MaxImpact 주요 서비스 영역</h6>
        <p>
          MaxImpact는{" "}
          <strong>웹 개발 외주</strong>,{" "}
          <strong>홈페이지 제작</strong>,{" "}
          <strong>쇼핑몰 개발</strong>,{" "}
          <strong>ERP·CRM 시스템 구축</strong>,{" "}
          <strong>AI SaaS 플랫폼 개발</strong>,{" "}
          <strong>iOS·Android 모바일 앱 개발</strong>,{" "}
          <strong>랜딩페이지 제작</strong>,{" "}
          <strong>반응형 웹 제작</strong>,{" "}
          <strong>기업 홈페이지 리뉴얼</strong>,{" "}
          <strong>OpenAI · Claude API 연동</strong>,{" "}
          <strong>챗봇 개발</strong>,{" "}
          <strong>마켓플레이스 구축</strong>,{" "}
          <strong>PG 결제 연동</strong>,{" "}
          <strong>스타트업 MVP 개발</strong>,{" "}
          <strong>외주 개발팀</strong>,{" "}
          <strong>프리랜서 대안 개발 파트너</strong>,{" "}
          <strong>풀스택 개발</strong>,{" "}
          <strong>Next.js · React · Node.js 개발</strong>,{" "}
          <strong>유지보수</strong>까지 서울 본사 기반 전국 단위로 서비스합니다.
        </p>
        <p className="footer-seo-tags">
          <span># 웹 개발</span><span># 외주 개발팀</span><span># 프리랜서 대안</span>
          <span># 쇼핑몰 제작</span><span># 소프트웨어 개발</span><span># 홈페이지 제작</span>
          <span># AI 개발</span><span># SaaS 개발</span><span># 앱 개발</span><span># ERP CRM</span>
          <span># 랜딩페이지</span><span># 반응형 웹</span><span># 풀스택</span><span># 유지보수</span>
        </p>
      </div>

      <div className="footer-bottom">
        <div className="footer-copy">© 2026 MaxImpact. All rights reserved.</div>
        <div className="footer-meta">서울특별시 · 대한민국 · AI · Web Development Team</div>
      </div>
    </footer>
  );
}
