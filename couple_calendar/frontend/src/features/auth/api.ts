import api from '@/utils/axios';

export interface SignupBody {
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  agreeMarketing: boolean;
}

export const checkUsername = (value: string) =>
  api.get<unknown, { available: boolean }>('/users/check-username', { params: { value } });

export const signup = (body: SignupBody) =>
  api.post<unknown, { id: number; username: string }>('/users', body);
