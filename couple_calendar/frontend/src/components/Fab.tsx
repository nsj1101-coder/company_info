import { PlusIcon } from './Icons';
import styles from './Fab.module.css';

export default function Fab({ onClick }: { onClick: () => void }) {
  return (
    <button className={styles.fab} onClick={onClick} aria-label="일정 추가">
      <PlusIcon size={26} />
    </button>
  );
}
