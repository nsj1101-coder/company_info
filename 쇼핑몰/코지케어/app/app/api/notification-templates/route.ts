import { NextResponse } from 'next/server';
import { Prisma, NotificationChannel } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type Body = {
  action?: 'seed';
  code?: string;
  name?: string;
  channel?: string;
  trigger?: string;
  content?: string;
  enabled?: boolean;
};

const DEFAULTS: Array<{ code: string; name: string; channel: NotificationChannel; trigger: string; content: string }> = [
  { code: 'order_paid', name: '결제 완료 안내', channel: NotificationChannel.kakao, trigger: '결제완료', content: '{{이름}}님, 주문 {{주문번호}} 결제가 완료되었습니다. 빠르게 준비하겠습니다.' },
  { code: 'doc_review', name: '복지용구 서류 검토중', channel: NotificationChannel.kakao, trigger: '서류검토', content: '{{이름}}님, 제출하신 복지용구 서류를 검토 중입니다. 공단 확인 후 안내드리겠습니다.' },
  { code: 'gov_check', name: '공단 확인중', channel: NotificationChannel.kakao, trigger: '공단확인', content: '{{이름}}님의 장기요양 인정 내역을 공단에 확인 중입니다. (1~2영업일 소요)' },
  { code: 'shipped', name: '출고/송장 안내', channel: NotificationChannel.kakao, trigger: '출고', content: '{{이름}}님, {{상품명}} 상품이 출고되었습니다. 송장번호 {{송장번호}}' },
  { code: 'delivered', name: '배송 완료', channel: NotificationChannel.kakao, trigger: '배송완료', content: '{{이름}}님, 주문하신 상품이 배송 완료되었습니다. 이용에 불편 없으시길 바랍니다.' },
  { code: 'refund_done', name: '환불 완료', channel: NotificationChannel.kakao, trigger: '환불완료', content: '{{이름}}님, 주문 {{주문번호}} 환불이 완료되었습니다.' },
  { code: 'biz_approved', name: '사업자 가입 승인', channel: NotificationChannel.kakao, trigger: '사업자승인', content: '{{이름}} 담당자님, 사업자 회원 가입이 승인되었습니다. 도매가로 주문하실 수 있습니다.' },
];

function toChannel(v: string | undefined): NotificationChannel {
  if (v === 'sms') return NotificationChannel.sms;
  if (v === 'email') return NotificationChannel.email;
  return NotificationChannel.kakao;
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  if (body.action === 'seed') {
    let created = 0;
    for (const d of DEFAULTS) {
      const exists = await prisma.notificationTemplate.findUnique({ where: { code: d.code } });
      if (!exists) {
        await prisma.notificationTemplate.create({ data: { ...d, enabled: true } });
        created += 1;
      }
    }
    return NextResponse.json({ ok: true, created });
  }

  if (!body.code?.trim() || !body.name?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: 'code, name, content는 필수입니다.' }, { status: 400 });
  }

  try {
    const created = await prisma.notificationTemplate.create({
      data: {
        code: body.code.trim(),
        name: body.name.trim(),
        channel: toChannel(body.channel),
        trigger: body.trigger ?? null,
        content: body.content,
        enabled: body.enabled ?? true,
      },
    });
    return NextResponse.json({ ok: true, id: created.id });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return NextResponse.json({ error: '이미 존재하는 코드입니다.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'create_failed' }, { status: 500 });
  }
}
