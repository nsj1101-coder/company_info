import { services } from "@/lib/data";

export default function Services() {
  return (
    <section id="services">
      <div className="wrap">
        <div className="sec-head reveal">
          <span className="eyebrow">Our Services</span>
          <h2>
            What we <span className="italic">build</span>
            <br />for you.
          </h2>
          <p>기업 시스템부터 개인 프로젝트까지, 단순 사이트가 아닌 비즈니스를 움직이는 제품을 만듭니다.</p>
        </div>

        <div className="services-grid stagger">
          {services.map((s) => (
            <div className="service" key={s.num}>
              <div className="service-arrow">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M5 11l6-6M6 5h5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="service-num">{s.num}</span>
              <h3>
                {s.title[0]}<br />{s.title[1]}
              </h3>
              <p>{s.desc}</p>
              <div className="service-tags">
                {s.tags.map((t) => <span key={t}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
