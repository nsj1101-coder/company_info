import { useEffect, useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import { useSchedules } from '@/features/schedules/hooks/useSchedules';
import { TODAY_KEY, fmtDateKR } from '@/utils/date';
import styles from './RemindersPage.module.css';

const NOTIFY_KEY = 'cc_notify';

export default function RemindersPage() {
  const { schedules } = useSchedules();
  const [enabled, setEnabled] = useState(
    () => localStorage.getItem(NOTIFY_KEY) === '1' && notifGranted(),
  );

  const upcoming = useMemo(
    () =>
      schedules
        .filter((s) => s.remind && s.date >= TODAY_KEY)
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [schedules],
  );

  // 앱이 열려 있는 동안 2일 이내 알림 타이머 등록
  useEffect(() => {
    if (!enabled) return;
    const timers = upcoming
      .map((s) => {
        const t = new Date(`${s.date}T${s.time || '09:00'}:00`).getTime() - Date.now();
        if (t > 0 && t < 86400000 * 2) {
          return window.setTimeout(
            () => new Notification('우리 캘린더', { body: `${s.title} ${s.time}` }),
            t,
          );
        }
        return null;
      })
      .filter((x): x is number => x != null);
    return () => timers.forEach(clearTimeout);
  }, [enabled, upcoming]);

  const requestNotify = async () => {
    if (!('Notification' in window)) {
      alert('이 브라우저는 알림을 지원하지 않아요.');
      return;
    }
    const perm = await Notification.requestPermission();
    const ok = perm === 'granted';
    localStorage.setItem(NOTIFY_KEY, ok ? '1' : '0');
    setEnabled(ok);
  };

  return (
    <Layout title="리마인더" subtitle="잊지 않게 알려드려요">
      <div className={styles.wrap}>
        <div className={styles.banner}>
          <h3>알림 받기 {enabled ? '· 켜짐' : ''}</h3>
          <p>
            브라우저 알림을 허용하면 일정 시간에 맞춰 리마인더를 보내드려요. (앱이 열려 있을 때
            동작)
          </p>
          <button onClick={requestNotify} disabled={enabled}>
            {enabled ? '알림 켜짐' : '알림 켜기'}
          </button>
        </div>

        <div className={styles.label}>예정된 알림</div>
        {upcoming.length ? (
          <ul>
            {upcoming.map((s) => (
              <li key={s.id} className={styles.item}>
                <span className={styles.dot} />
                <div className={styles.body}>
                  <strong>{s.title}</strong>
                  <span>
                    {fmtDateKR(s.date)}
                    {s.time ? ` ${s.time}` : ''}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>
            알림으로 설정한 일정이 없어요
            <br />
            일정 추가 시 ‘알림 받기’를 켜보세요
          </p>
        )}
      </div>
    </Layout>
  );
}

function notifGranted() {
  return 'Notification' in window && Notification.permission === 'granted';
}
