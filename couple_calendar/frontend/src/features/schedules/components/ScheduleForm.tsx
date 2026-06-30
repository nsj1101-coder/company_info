import { useState } from 'react';
import type { Schedule, ScheduleInput, ScheduleCategory, ScheduleOwner } from '@/types';
import { CATEGORIES, OWNERS } from '@/constants';
import { openPostcode } from '@/utils/postcode';
import styles from './ScheduleForm.module.css';

interface Props {
  initial?: Schedule;
  defaultDate: string;
  onSubmit: (body: ScheduleInput) => Promise<void> | void;
  onDelete?: () => void;
}

const EMPTY = (date: string): ScheduleInput => ({
  title: '',
  category: 'date',
  owner: 'both',
  date,
  time: '',
  address: '',
  addrDetail: '',
  memo: '',
  remind: false,
});

export default function ScheduleForm({ initial, defaultDate, onSubmit, onDelete }: Props) {
  const [form, setForm] = useState<ScheduleInput>(initial ? { ...initial } : EMPTY(defaultDate));
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof ScheduleInput>(k: K, v: ScheduleInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ ...form, title: form.title.trim() });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className={styles.field}>
        <label>제목</label>
        <input
          type="text"
          placeholder="예) 저녁 데이트"
          value={form.title}
          maxLength={60}
          onChange={(e) => set('title', e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label>유형</label>
        <div className={styles.chips}>
          {(Object.keys(CATEGORIES) as ScheduleCategory[]).map((k) => (
            <button
              key={k}
              type="button"
              className={`${styles.chip} ${form.category === k ? styles.chipOn : ''}`}
              onClick={() => set('category', k)}
            >
              {CATEGORIES[k].label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label>누구</label>
        <div className={styles.chips}>
          {(Object.keys(OWNERS) as ScheduleOwner[]).map((k) => (
            <button
              key={k}
              type="button"
              className={`${styles.chip} ${form.owner === k ? styles.chipOn : ''}`}
              onClick={() => set('owner', k)}
            >
              {OWNERS[k].label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.row2}>
        <div className={styles.field}>
          <label>날짜</label>
          <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>시간</label>
          <input type="time" value={form.time} onChange={(e) => set('time', e.target.value)} />
        </div>
      </div>

      <div className={styles.field}>
        <label>장소</label>
        <div className={styles.addrBox}>
          <input type="text" placeholder="주소 검색" value={form.address} readOnly />
          <button type="button" onClick={() => openPostcode((a) => set('address', a))}>
            검색
          </button>
        </div>
      </div>

      {form.address && (
        <div className={styles.field}>
          <label>상세 주소</label>
          <input
            type="text"
            placeholder="예) 3층 카페"
            value={form.addrDetail}
            maxLength={60}
            onChange={(e) => set('addrDetail', e.target.value)}
          />
        </div>
      )}

      <div className={styles.field}>
        <label>메모</label>
        <textarea
          placeholder="기억할 내용을 적어두세요"
          value={form.memo}
          maxLength={300}
          onChange={(e) => set('memo', e.target.value)}
        />
      </div>

      <div className={styles.switchRow}>
        <span>알림 받기</span>
        <button
          type="button"
          className={`${styles.switch} ${form.remind ? styles.switchOn : ''}`}
          onClick={() => set('remind', !form.remind)}
          aria-pressed={form.remind}
        >
          <span className={styles.knob} />
        </button>
      </div>

      <div className={styles.actions}>
        {onDelete && (
          <button type="button" className={styles.ghost} onClick={onDelete}>
            삭제
          </button>
        )}
        <button type="button" className={styles.primary} onClick={submit} disabled={saving}>
          {initial ? '수정하기' : '추가하기'}
        </button>
      </div>
    </div>
  );
}
