import { processSteps, type ProcessStep } from "@/lib/data";

function StepIcon({ icon }: { icon: ProcessStep["icon"] }) {
  if (icon === "lightbulb") return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (icon === "layout") return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 4h16M4 12h16M4 20h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
  if (icon === "code") return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 16l-4-4 4-4M15 8l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12l3 3 9-9M21 12l-3-3-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Process() {
  return (
    <section id="process">
      <div className="wrap">
        <div className="sec-head reveal">
          <span className="eyebrow">How we work</span>
          <h2>
            From idea<br />
            to <span className="italic">launch.</span>
          </h2>
          <p>체계적인 4단계 프로세스로 빠르고 정확하게, 그리고 정직하게 완성합니다.</p>
        </div>

        <div className="process-grid stagger">
          {processSteps.map((s) => (
            <div className="process-step" key={s.num}>
              <span className="step-num">{s.num}</span>
              <div className="step-icon"><StepIcon icon={s.icon} /></div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
