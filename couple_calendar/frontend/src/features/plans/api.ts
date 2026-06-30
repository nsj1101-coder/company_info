import api from '@/utils/axios';
import type { Plan } from '@/types';

export const fetchPlans = () => api.get<unknown, Plan[]>('/plans');
export const createPlan = (text: string) => api.post<unknown, Plan>('/plans', { text });
export const updatePlan = (id: number, body: Partial<Pick<Plan, 'text' | 'done'>>) =>
  api.patch<unknown, Plan>(`/plans/${id}`, body);
export const deletePlan = (id: number) => api.delete(`/plans/${id}`);
