import api from '@/utils/axios';
import type { Schedule, ScheduleInput } from '@/types';

export const fetchSchedules = (month?: string) =>
  api.get<unknown, Schedule[]>('/schedules', { params: month ? { month } : {} });

export const createSchedule = (body: ScheduleInput) =>
  api.post<unknown, Schedule>('/schedules', body);

export const updateSchedule = (id: number, body: Partial<ScheduleInput>) =>
  api.patch<unknown, Schedule>(`/schedules/${id}`, body);

export const deleteSchedule = (id: number) => api.delete(`/schedules/${id}`);
