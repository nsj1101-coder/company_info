import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const head = local.slice(0, 2);
  return `${head}${'*'.repeat(Math.max(2, local.length - 2))}@${domain}`;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { name?: string; phone?: string } | null;
  const name = (body?.name ?? '').trim();
  const phone = (body?.phone ?? '').trim();
  if (!name || !phone) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const digits = phone.replace(/\D/g, '');
  const candidates = await prisma.user.findMany({
    where: { name, role: 'user' },
    select: { email: true, phone: true, createdAt: true },
  });
  const user = candidates.find((u) => (u.phone ?? '').replace(/\D/g, '') === digits) ?? null;
  if (!user) {
    return NextResponse.json({ found: false }, { status: 404 });
  }
  return NextResponse.json({ found: true, maskedEmail: maskEmail(user.email) });
}
