export type ScheduleCategory = 'date' | 'anniv' | 'promise' | 'todo' | 'etc';
export type ScheduleOwner = 'me' | 'partner' | 'both';

export interface Schedule {
  id: number;
  title: string;
  category: ScheduleCategory;
  owner: ScheduleOwner;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm | ''
  address: string;
  addrDetail: string;
  memo: string;
  remind: boolean;
}

export type ScheduleInput = Omit<Schedule, 'id'>;

export interface Plan {
  id: number;
  text: string;
  done: boolean;
}

export interface Couple {
  id: number;
  me: string;
  partner: string;
  anniversary: string; // YYYY-MM-DD | ''
}
