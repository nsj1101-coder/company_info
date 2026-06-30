import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useCouple } from '@/features/couple/hooks/useCouple';
import { ddayFrom } from '@/utils/date';
import styles from './UsPage.module.css';

export default function UsPage() {
  const { couple, save } = useCouple();
  const [me, setMe] = useState('');
  const [partner, setPartner] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (couple) {
      setMe(couple.me);
      setPartner(couple.partner);
      setAnniversary(couple.anniversary);
    }
  }, [couple]);

  const dday = ddayFrom(anniversary);

  const onSave = async () => {
    await save({ me: me.trim() || '나', partner: partner.trim() || '그대', anniversary });
    setToast(true);
    setTimeout(() => setToast(false), 1500);
  };

  return (
    <Layout title="우리" subtitle="커플 정보 설정">
      <div className={styles.wrap}>
        <div className={styles.card}>
          <div className={styles.names}>
            {me || '나'} <span className={styles.amp}>&amp;</span> {partner || '그대'}
          </div>
          {dday != null ? (
            <div className={styles.dday}>함께한 지 {dday}일째 · D+{dday}</div>
          ) : (
            <div className={styles.ddayMuted}>기념일을 등록해보세요</div>
          )}
        </div>

        <div className={styles.card}>
          <div className={styles.field}>
            <label>내 이름</label>
            <input type="text" value={me} maxLength={10} onChange={(e) => setMe(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label>상대 이름</label>
            <input
              type="text"
              value={partner}
              maxLength={10}
              onChange={(e) => setPartner(e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label>처음 만난 날 (기념일)</label>
            <input
              type="date"
              value={anniversary}
              onChange={(e) => setAnniversary(e.target.value)}
            />
          </div>
          <button className={styles.save} onClick={onSave}>
            저장하기
          </button>
        </div>
      </div>

      <div className={`toast ${toast ? 'show' : ''}`}>저장됐어요</div>
    </Layout>
  );
}
