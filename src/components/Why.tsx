import { whyItems } from "@/lib/data";

export default function Why() {
  return (
    <section id="why">
      <div className="wrap">
        <div className="sec-head reveal">
          <span className="eyebrow">Why MaxImpact</span>
          <h2>
            Not just another<br />
            <span className="italic">agency.</span>
          </h2>
          <p>저렴한 외주가 아닌, 비즈니스 파트너로서 책임지고 결과를 만듭니다.</p>
        </div>

        <div className="why-grid stagger">
          {whyItems.map((w) => (
            <div className="why-item" key={w.num}>
              <div className="why-num">{w.num}</div>
              <h3>{w.title}</h3>
              <p>{w.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
