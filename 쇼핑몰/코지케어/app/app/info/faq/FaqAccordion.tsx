'use client';

import { useState } from 'react';

export type FaqItem = { id: number; question: string; answer: string };
export type FaqCat = { id: number; name: string; faqs: FaqItem[] };

export default function FaqAccordion({ cats }: { cats: FaqCat[] }) {
  const [activeCat, setActiveCat] = useState<number | 'all'>('all');
  const [openId, setOpenId] = useState<number | null>(null);

  const visibleCats = activeCat === 'all' ? cats : cats.filter((c) => c.id === activeCat);
  const items: FaqItem[] = visibleCats.flatMap((c) => c.faqs);

  return (
    <div className="faq-board">
      <div className="faq-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeCat === 'all'}
          className={`faq-tab${activeCat === 'all' ? ' active' : ''}`}
          onClick={() => { setActiveCat('all'); setOpenId(null); }}
        >
          전체
        </button>
        {cats.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={activeCat === c.id}
            className={`faq-tab${activeCat === c.id ? ' active' : ''}`}
            onClick={() => { setActiveCat(c.id); setOpenId(null); }}
          >
            {c.name}
          </button>
        ))}
      </div>

      <ul className="faq-list">
        {items.map((f) => {
          const open = openId === f.id;
          return (
            <li key={f.id} className={`faq-item${open ? ' open' : ''}`}>
              <button
                type="button"
                className="faq-q"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : f.id)}
              >
                <span className="faq-q-mark">Q</span>
                <span className="faq-q-text">{f.question}</span>
                <span className="faq-q-arrow">{open ? '−' : '+'}</span>
              </button>
              {open && (
                <div className="faq-a">
                  <span className="faq-a-mark">A</span>
                  <div className="faq-a-text">
                    {f.answer.split('\n').map((line, i) => (
                      <p key={i} style={{ margin: i === 0 ? 0 : '8px 0 0' }}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </li>
          );
        })}
        {items.length === 0 && <li className="faq-empty">등록된 질문이 없습니다.</li>}
      </ul>
    </div>
  );
}
