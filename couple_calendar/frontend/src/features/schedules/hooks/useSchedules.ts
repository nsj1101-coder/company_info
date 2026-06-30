import { useCallback, useEffect, useState } from 'react';
import type { Schedule, ScheduleInput } from '@/types';
import {
  createSchedule,
  deleteSchedule,
  fetchSchedules,
  updateSchedule,
} from '../api';

export function useSchedules(month?: string) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setSchedules(await fetchSchedules(month));
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    reload();
  }, [reload]);

  const add = useCallback(
    async (body: ScheduleInput) => {
      await createSchedule(body);
      await reload();
    },
    [reload],
  );

  const edit = useCallback(
    async (id: number, body: Partial<ScheduleInput>) => {
      await updateSchedule(id, body);
      await reload();
    },
    [reload],
  );

  const remove = useCallback(
    async (id: number) => {
      await deleteSchedule(id);
      await reload();
    },
    [reload],
  );

  return { schedules, loading, reload, add, edit, remove };
}
