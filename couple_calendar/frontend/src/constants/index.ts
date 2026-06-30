import type { ScheduleCategory, ScheduleOwner } from '@/types';

// 흑백 테마: 색상 대신 회색 명도로 유형 구분 (이모지/컬러 아이콘 미사용)
export const CATEGORIES: Record<ScheduleCategory, { label: string; shade: string }> = {
  date: { label: '데이트', shade: '#111111' },
  anniv: { label: '기념일', shade: '#3a3a3a' },
  promise: { label: '약속', shade: '#6a6a6a' },
  todo: { label: '할일', shade: '#9a9a9a' },
  etc: { label: '기타', shade: '#c2c2c2' },
};

export const OWNERS: Record<ScheduleOwner, { label: string }> = {
  me: { label: '나' },
  partner: { label: '상대' },
  both: { label: '같이' },
};

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
