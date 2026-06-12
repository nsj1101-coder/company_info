import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getCurrentSession } from '@/lib/session';

const HEADERS = ['상품코드', '작성자', '별점(1-5)', '제목', '내용'];
const SAMPLE = [
  ['CZ-0001', '김복지', 5, '어머니가 편해하세요', '바퀴가 부드럽고 안정적입니다. 강력 추천합니다.'],
  ['CZ-0002', '박효도', 4, '튼튼해요', '생각보다 무게감 있고 잘 만들어졌습니다.'],
];

export async function GET() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...SAMPLE]);
  ws['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 22 }, { wch: 40 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '리뷰양식');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="cozycare-review-template.xlsx"',
    },
  });
}
