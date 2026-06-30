import type { Schedule } from '@/types';
import { CATEGORIES, OWNERS } from '@/constants';
import { ChevronRightIcon } from '@/components/Icons';
import styles from './ScheduleItem.module.css';

interface Props {
  schedule: Schedule;
  onClick?: () => void;
}

export default function ScheduleItem({ schedule, onClick }: Props) {
  const cat = CATEGORIES[schedule.category];
  return (
    <button className={styles.row} onClick={onClick}>
      <span className={styles.bar} style={{ background: cat.shade }} />
      <span className={styles.body}>
        <span className={styles.top}>
          <span className={styles.title}>{schedule.title}</span>
          {schedule.time && <span className={styles.time}>{schedule.time}</span>}
        </span>
        <span className={styles.meta}>
          <span className={styles.owner}>{OWNERS[schedule.owner].label}</span>
          <span className={styles.cat}>{cat.label}</span>
          {schedule.address && <span className={styles.addr}>· {schedule.address}</span>}
        </span>
      </span>
      <ChevronRightIcon size={18} />
    </button>
  );
}
