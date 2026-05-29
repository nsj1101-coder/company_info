"use client";

import { useEffect, useRef, useState } from "react";
import { metrics } from "@/lib/data";

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          let cur = 0;
          const inc = target / 30;
          const t = setInterval(() => {
            cur += inc;
            if (cur >= target) { setVal(target); clearInterval(t); }
            else setVal(Math.floor(cur));
          }, 30);
          obs.unobserve(el);
        });
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {val}
      <span className="unit">{suffix}</span>
    </span>
  );
}

export default function Metrics() {
  return (
    <div className="metrics">
      <div className="metrics-grid">
        {metrics.map((m) => (
          <div className="metric" key={m.label}>
            <div className="metric-value">
              <CountUp target={m.value} suffix={m.unit} />
            </div>
            <div className="metric-label">{m.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
