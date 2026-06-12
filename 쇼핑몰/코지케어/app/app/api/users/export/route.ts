import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';

const HEADERS = ['이름', '이메일', '연락처', '가입일', '상태', '주문수', '총구매액'];

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const STATUS_LABEL: Record<string, string> = { active: '활성', dormant: '휴면', withdrawn: '탈퇴' };

export async function GET() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    where: { role: 'user' },
    include: { orders: { select: { totalPrice: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10000,
  });

  const rows = users.map((u) => {
    const total = u.orders.reduce((s, o) => s + o.totalPrice, 0);
    return [u.name, u.email, u.phone ?? '', fmt(u.createdAt), STATUS_LABEL[u.status] ?? u.status, u.orders.length, total];
  });

  const ws = XLSX.utils.aoa_to_sheet([HEADERS, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'members');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="cozycare-members.xlsx"',
    },
  });
}
