import { useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import Fab from '@/components/Fab';
import BottomSheet from '@/components/BottomSheet';
import ScheduleItem from '@/features/schedules/components/ScheduleItem';
import ScheduleForm from '@/features/schedules/components/ScheduleForm';
import ScheduleDetail from '@/features/schedules/components/ScheduleDetail';
import { useSchedules } from '@/features/schedules/hooks/useSchedules';
import type { Schedule, ScheduleInput } from '@/types';
import { TODAY_KEY, fmtDateKR } from '@/utils/date';
import styles from './SchedulesPage.module.css';

type Mode = 'none' | 'add' | 'edit' | 'detail';

export default function SchedulesPage() {
  const { schedules, add, edit, remove } = useSchedules();
  const [mode, setMode] = useState<Mode>('none');
  const [active, setActive] = useState<Schedule | null>(null);

  const groups = useMemo(() => {
    const upcoming = schedules
      .filter((s) => s.date >= TODAY_KEY)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const map = new Map<string, Schedule[]>();
    upcoming.forEach((s) => {
      const arr = map.get(s.date) ?? [];
      arr.push(s);
      map.set(s.date, arr);
    });
    return [...map.entries()];
  }, [schedules]);

  const close = () => {
    setMode('none');
    setActive(null);
  };

  const onSubmit = async (body: ScheduleInput) => {
    if (mode === 'edit' && active) await edit(active.id, body);
    else await add(body);
    close();
  };

  const onDelete = async () => {
    if (active && confirm('이 일정을 삭제할까요?')) {
      await remove(active.id);
      close();
    }
  };

  return (
    <Layout title="일정" subtitle="다가오는 약속 모아보기">
      {groups.length ? (
        <div className={styles.wrap}>
          {groups.map(([date, list]) => (
            <div key={date}>
              <div className={styles.group}>
                {fmtDateKR(date)}
                {date === TODAY_KEY && <span className={styles.today}>오늘</span>}
              </div>
              <div className={styles.card}>
                {list.map((s) => (
                  <ScheduleItem
                    key={s.id}
                    schedule={s}
                    onClick={() => {
                      setActive(s);
                      setMode('detail');
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>예정된 일정이 없어요</p>
      )}

      <Fab
        onClick={() => {
          setActive(null);
          setMode('add');
        }}
      />

      <BottomSheet
        open={mode === 'add' || mode === 'edit'}
        title={mode === 'edit' ? '일정 수정' : '일정 추가'}
        onClose={close}
      >
        <ScheduleForm
          initial={mode === 'edit' ? active ?? undefined : undefined}
          defaultDate={TODAY_KEY}
          onSubmit={onSubmit}
          onDelete={mode === 'edit' ? onDelete : undefined}
        />
      </BottomSheet>

      <BottomSheet open={mode === 'detail'} title="일정 상세" onClose={close}>
        {active && (
          <ScheduleDetail schedule={active} onEdit={() => setMode('edit')} onClose={close} />
        )}
      </BottomSheet>
    </Layout>
  );
}
