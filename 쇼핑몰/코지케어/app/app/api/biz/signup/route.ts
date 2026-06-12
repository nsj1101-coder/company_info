import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type SignupBody = {
  companyName?: string;
  ceoName?: string;
  bizNumber?: string;
  zipcode?: string;
  address1?: string;
  address2?: string;
  bizPhone?: string;
  managerPhone?: string;
  email?: string;
  password?: string;
  bizType?: string;
  // (구) 직접 호출 호환
  bizNo?: string;
  owner?: string;
  phone?: string;
  loginId?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as SignupBody | null;
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const email = (body.email ?? '').trim().toLowerCase();
  const password = body.password ?? '';
  const companyName = (body.companyName ?? '').trim();
  const bizNo = (body.bizNumber ?? body.bizNo ?? '').trim();

  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'invalid_email' }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: 'weak_password' }, { status: 400 });
  if (!companyName) return NextResponse.json({ error: 'missing_company' }, { status: 400 });
  if (!bizNo) return NextResponse.json({ error: 'missing_bizno' }, { status: 400 });

  // 로그인 아이디 = 이메일 (별도 loginId 미수집 → 이메일로 로그인)
  const loginId = (body.loginId ?? email).trim();
  const owner = (body.ceoName ?? body.owner ?? '').trim() || '대표자';
  const phone = (body.bizPhone ?? body.managerPhone ?? body.phone ?? '').trim() || '010-0000-0000';
  const hashed = await bcrypt.hash(password, 10);

  try {
    const member = await prisma.bizMember.create({
      data: {
        companyName,
        bizNo,
        owner,
        phone,
        email,
        loginId,
        password: hashed,
        zonecode: body.zipcode?.trim() || null,
        roadAddress: body.address1?.trim() || null,
        detailAddress: body.address2?.trim() || null,
        businessType: body.bizType?.trim() || null,
        status: 'pending',
      },
    });
    await prisma.bizApproval.create({ data: { bizId: member.id, step: 'submit', note: '사업자 가입 신청' } }).catch(() => null);
    return NextResponse.json({ ok: true, success: true, id: member.id, loginId }, { status: 200 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const target = (e.meta?.target as string[] | undefined)?.join(',') ?? '';
      const which = target.includes('bizNo') ? 'duplicate_bizno' : target.includes('email') ? 'duplicate_email' : 'duplicate';
      return NextResponse.json({ error: which }, { status: 409 });
    }
    return NextResponse.json({ error: 'create_failed' }, { status: 500 });
  }
}
