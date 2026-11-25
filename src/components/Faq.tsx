import type { Faq as FaqItem } from "@/lib/data";

type Props = { items: FaqItem[]; title?: string };

export default function Faq({ items, title = "자주 묻는 질문" }: Props) {
  return (
    <section id="faq" aria-label={title}>
      <div className="wrap-narrow">
        <div className="sec-head reveal">
          <span className="eyebrow">FAQ</span>
          <h2>{title}</h2>
        </div>
        <div className="faq-list">
          {items.map((f) => (
            <details className="faq-item" key={f.q}>
              <summary><h3>{f.q}</h3></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
