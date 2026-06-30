import type { Schedule } from '@/types';
import { CATEGORIES, OWNERS } from '@/constants';
import { ClockIcon, PinIcon, MemoIcon, UsersIcon, BellIcon } from '@/components/Icons';
import { fmtDateKR } from '@/utils/date';
import styles from './ScheduleDetail.module.css';

interface Props {
  schedule: Schedule;
  onEdit: () => void;
  onClose: () => void;
}

export default function ScheduleDetail({ schedule: s, onEdit, onClose }: Props) {
  const cat = CATEGORIES[s.category];
  const mapUrl = s.address ? `https://map.kakao.com/?q=${encodeURIComponent(s.address)}` : null;

  return (
    <div>
      <div className={styles.title}>
        <span className={styles.dot} style={{ background: cat.shade }} />
        {s.title}
      </div>

      <div className={styles.row}>
        <ClockIcon />
        <div>
          <div className={styles.label}>날짜 / 시간</div>
          <div className={styles.value}>
            {fmtDateKR(s.date)}
            {s.time ? ` · ${s.time}` : ''}
          </div>
        </div>
      </div>

      <div className={styles.row}>
        <UsersIcon size={18} />
        <div>
          <div className={styles.label}>함께 · 유형</div>
          <div className={styles.value}>
            {OWNERS[s.owner].label} · {cat.label}
          </div>
        </div>
      </div>

      {s.address && (
        <div className={styles.row}>
          <PinIcon />
          <div>
            <div className={styles.label}>장소</div>
            <div className={styles.value}>
              {s.address}
              {s.addrDetail ? ` ${s.addrDetail}` : ''}
            </div>
            {mapUrl && (
              <a className={styles.link} href={mapUrl} target="_blank" rel="noopener noreferrer">
                지도에서 보기
              </a>
            )}
          </div>
        </div>
      )}

      {s.memo && (
        <div className={styles.row}>
          <MemoIcon />
          <div>
            <div className={styles.label}>메모</div>
            <div className={styles.value}>{s.memo}</div>
          </div>
        </div>
      )}

      {s.remind && (
        <div className={styles.row}>
          <BellIcon size={18} />
          <div>
            <div className={styles.label}>알림</div>
            <div className={styles.value}>알림 받기 켜짐</div>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <button className={styles.ghost} onClick={onEdit}>
          수정
        </button>
        <button className={styles.primary} onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
}
