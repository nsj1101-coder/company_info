import api from '@/utils/axios';
import type { Couple } from '@/types';

export const fetchCouple = () => api.get<unknown, Couple>('/couple');
export const updateCouple = (body: Partial<Omit<Couple, 'id'>>) =>
  api.patch<unknown, Couple>('/couple', body);
