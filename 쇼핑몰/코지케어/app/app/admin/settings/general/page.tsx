import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import GeneralForm, { type GeneralValues } from './GeneralForm';

const DEFAULTS: GeneralValues = {
  companyName: '주식회사 코지케어',
  owner: '홍길동',
  bizNo: '123-45-67890',
  address: '경기 파주시 조리읍 고봉로 123-4',
  phone: '1588-0000',
  csEmail: 'cs@cozycare.co.kr',
  weekdayHours: '09:00 ~ 18:00 (점심 12:00 ~ 13:00)',
  saturdayHours: '09:00 ~ 13:00',
  holiday: '일요일 및 공휴일 휴무',
  salesReportNo: '2026-경기파주-0123',
  welfareLicenseNo: '제2026-1234호',
  privacyOfficer: '김민수 / privacy@cozycare.co.kr',
};

const KEY_MAP: Record<keyof GeneralValues, string> = {
  companyName: 'general.companyName',
  owner: 'general.owner',
  bizNo: 'general.bizNo',
  address: 'general.address',
  phone: 'general.phone',
  csEmail: 'general.csEmail',
  weekdayHours: 'general.weekdayHours',
  saturdayHours: 'general.saturdayHours',
  holiday: 'general.holiday',
  salesReportNo: 'general.salesReportNo',
  welfareLicenseNo: 'general.welfareLicenseNo',
  privacyOfficer: 'general.privacyOfficer',
};

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const rows = await prisma.setting.findMany({ where: { scope: 'general' } });
  const byKey = new Map(rows.map((r) => [r.key, r.value]));

  const initial = { ...DEFAULTS };
  (Object.keys(KEY_MAP) as (keyof GeneralValues)[]).forEach((field) => {
    const stored = byKey.get(KEY_MAP[field]);
    if (typeof stored === 'string') initial[field] = stored;
  });

  return <GeneralForm initial={initial} />;
}
