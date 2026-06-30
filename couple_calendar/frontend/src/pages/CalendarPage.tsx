import { useMemo, useState } from 'react';
import Layout from '@/components/Layout';
import Fab from '@/components/Fab';
import BottomSheet from '@/components/BottomSheet';
import Calendar from '@/features/schedules/components/Calendar';
import ScheduleItem from '@/features/schedules/components/ScheduleItem';
import ScheduleForm from '@/features/schedules/components/ScheduleForm';
import ScheduleDetail from '@/features/schedules/components/ScheduleDetail';
import { useSchedules } from '@/features/schedules/hooks/useSchedules';
import { useCouple } from '@/features/couple/hooks/useCouple';
import type { Schedule, ScheduleInput } from '@/types';
import { TODAY_KEY, fmtDateKR, pad, ddayFrom } from '@/utils/date';
import styles from './CalendarPage.module.css';

type Mode = 'none' | 'add' | 'edit' | 'detail';

export default function CalendarPage() {
  const now = new Date();
  const [viewY, setViewY] = useState(now.getFullYear());
  const [viewM, setViewM] = useState(now.getMonth());
  const [selected, setSelected] = useState(TODAY_KEY);
  const [mode, setMode] = useState<Mode>('none');
  const [active, setActive] = useState<Schedule | null>(null);

  const month = `${viewY}-${pad(viewM + 1)}`;
  const { schedules, add, edit, remove } = useSchedules(month);
  const { couple } = useCouple();
  const dday = couple ? ddayFrom(couple.anniversary) : null;

  const dayList = useMemo(
    () => schedules.filter((s) => s.date === selected),
    [schedules, selected],
  );

  const move = (delta: number) => {
    let m = viewM + delta;
    let y = viewY;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewY(y);
    setViewM(m);
  };

  const close = () => {
    setMode('none');
    setActive(null);
  };

  const onSubmit = async (body: ScheduleInput) => {
    if (mode === 'edit' && active) await edit(active.id, body);
    else await add(body);
    setSelected(body.date);
    const [y, m] = body.date.split('-').map(Number);
    setViewY(y);
    setViewM(m - 1);
    close();
  };

  const onDelete = async () => {
    if (active && confirm('이 일정을 삭제할까요?')) {
      await remove(active.id);
      close();
    }
  };

  return (
    <Layout
      title={
        <>
          우리 <span className={styles.thin}>캘린더</span>
        </>
      }
      subtitle="둘만의 일정을 한눈에"
      right={dday != null ? <span className={styles.dday}>D+{dday}</span> : undefined}
    >
      <Calendar
        year={viewY}
        month={viewM}
        selected={selected}
        schedules={schedules}
        onSelect={setSelected}
        onMove={move}
      />

      <section className={styles.panel}>
        <div className={styles.head}>
          <strong className={styles.date}>{fmtDateKR(selected)}</strong>
          <span className={styles.count}>일정 {dayList.length}개</span>
        </div>

        {dayList.length ? (
          <ul>
            {dayList.map((s) => (
              <li key={s.id}>
                <ScheduleItem
                  schedule={s}
                  onClick={() => {
                    setActive(s);
                    setMode('detail');
                  }}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>
            이 날은 일정이 없어요
            <br />
            아래 + 버튼으로 추가해보세요
          </p>
        )}
      </section>

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
          defaultDate={selected}
          onSubmit={onSubmit}
          onDelete={mode === 'edit' ? onDelete : undefined}
        />
      </BottomSheet>

      <BottomSheet open={mode === 'detail'} title="일정 상세" onClose={close}>
        {active && (
          <ScheduleDetail
            schedule={active}
            onEdit={() => setMode('edit')}
            onClose={close}
          />
        )}
      </BottomSheet>
    </Layout>
  );
}
