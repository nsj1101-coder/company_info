import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getCurrentSession } from '@/lib/session';

const HEADERS = ['주문번호', '택배사', '송장번호'];
const SAMPLE = [
  ['OD-20260001', 'CJ대한통운', '1234567890'],
  ['OD-20260002', '한진택배', '9876543210'],
];

export async function GET() {
  const session = await getCurrentSession();
  if (!session || (session.role !== 'admin' && session.role !== 'biz')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...SAMPLE]);
  ws['!cols'] = [{ wch: 18 }, { wch: 16 }, { wch: 18 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '송장양식');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="cozycare-invoice-template.xlsx"',
    },
  });
}
