import { useState } from 'react';
import Layout from '@/components/Layout';
import { usePlans } from '@/features/plans/hooks/usePlans';
import styles from './PlansPage.module.css';

export default function PlansPage() {
  const { plans, add, toggle, remove } = usePlans();
  const [text, setText] = useState('');

  const submit = async () => {
    const v = text.trim();
    if (!v) return;
    await add(v);
    setText('');
  };

  return (
    <Layout title="계획표" subtitle="같이 하고 싶은 것들">
      <div className={styles.wrap}>
        <div className={styles.add}>
          <input
            type="text"
            placeholder="우리 버킷리스트 추가"
            value={text}
            maxLength={80}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <button onClick={submit}>추가</button>
        </div>

        {plans.length ? (
          <ul>
            {plans.map((p) => (
              <li key={p.id} className={`${styles.item} ${p.done ? styles.done : ''}`}>
                <button className={styles.check} onClick={() => toggle(p)} aria-label="완료 토글">
                  {p.done && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 13l4 4 10-10"
                        stroke="#fff"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
                <span className={styles.text}>{p.text}</span>
                <button className={styles.del} onClick={() => remove(p.id)} aria-label="삭제">
                  ✕
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>
            같이 하고 싶은 걸 적어보세요
            <br />
            예) 벚꽃 보러 가기, 캠핑, 오마카세
          </p>
        )}
      </div>
    </Layout>
  );
}
