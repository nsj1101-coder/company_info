import { useCallback, useEffect, useState } from 'react';
import type { Couple } from '@/types';
import { fetchCouple, updateCouple } from '../api';

export function useCouple() {
  const [couple, setCouple] = useState<Couple | null>(null);

  const reload = useCallback(async () => {
    setCouple(await fetchCouple());
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const save = useCallback(
    async (body: Partial<Omit<Couple, 'id'>>) => {
      setCouple(await updateCouple(body));
    },
    [],
  );

  return { couple, reload, save };
}
