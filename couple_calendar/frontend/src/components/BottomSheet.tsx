import { ReactNode } from 'react';
import { CloseIcon } from './Icons';
import styles from './BottomSheet.module.css';

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function BottomSheet({ open, title, onClose, children }: Props) {
  return (
    <>
      <div
        className={`${styles.dim} ${open ? styles.show : ''}`}
        onClick={onClose}
        aria-hidden
      />
      <div className={`${styles.sheet} ${open ? styles.show : ''}`} role="dialog" aria-modal>
        <div className={styles.handle} />
        <div className={styles.head}>
          <strong className={styles.st}>{title}</strong>
          <button className={styles.close} onClick={onClose} aria-label="닫기">
            <CloseIcon />
          </button>
        </div>
        <div className={styles.body}>{open && children}</div>
      </div>
    </>
  );
}
