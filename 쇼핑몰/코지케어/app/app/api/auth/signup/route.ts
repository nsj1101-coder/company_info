import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type SignupBody = {
  name?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
  phone?: string;
  zipcode?: string;
  address1?: string;
  address2?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as SignupBody | null;
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const email = (body.email ?? '').trim().toLowerCase();
  const password = body.password ?? '';
  const name = (body.name ?? '').trim() || email.split('@')[0];

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'weak_password' }, { status: 400 });
  }
  if (body.passwordConfirm !== undefined && body.passwordConfirm !== password) {
    return NextResponse.json({ error: 'password_mismatch' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        phone: body.phone?.trim() || null,
        zonecode: body.zipcode?.trim() || null,
        roadAddress: body.address1?.trim() || null,
        detailAddress: body.address2?.trim() || null,
        role: 'user',
        status: 'active',
      },
    });
    return NextResponse.json({ ok: true, id: user.id }, { status: 200 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json({ error: 'duplicate_email' }, { status: 409 });
    }
    return NextResponse.json({ error: 'create_failed' }, { status: 500 });
  }
}
