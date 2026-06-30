import { useCallback, useEffect, useState } from 'react';
import type { Plan } from '@/types';
import { createPlan, deletePlan, fetchPlans, updatePlan } from '../api';

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setPlans(await fetchPlans());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const add = useCallback(
    async (text: string) => {
      await createPlan(text);
      await reload();
    },
    [reload],
  );

  const toggle = useCallback(
    async (p: Plan) => {
      await updatePlan(p.id, { done: !p.done });
      await reload();
    },
    [reload],
  );

  const remove = useCallback(
    async (id: number) => {
      await deletePlan(id);
      await reload();
    },
    [reload],
  );

  return { plans, loading, add, toggle, remove };
}
