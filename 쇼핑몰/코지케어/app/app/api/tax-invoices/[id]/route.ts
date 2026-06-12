import { NextResponse } from 'next/server';
import { TaxInvoiceStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

type RouteContext = { params: Promise<{ id: string }> };

type PatchBody = { status?: string; ntsNo?: string; memo?: string };

const STATUS_MAP: Record<string, TaxInvoiceStatus> = {
  requested: TaxInvoiceStatus.requested,
  issued: TaxInvoiceStatus.issued,
  cancelled: TaxInvoiceStatus.cancelled,
};

export async function PATCH(req: Request, ctx: RouteContext) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });

  const body = (await req.json().catch(() => null)) as PatchBody | null;
  if (!body) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const existing = await prisma.taxInvoice.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const status = body.status ? STATUS_MAP[body.status] : undefined;
  if (body.status && !status) return NextResponse.json({ error: 'invalid_status' }, { status: 400 });

  await prisma.taxInvoice.update({
    where: { id },
    data: {
      status: status ?? existing.status,
      ntsNo: body.ntsNo !== undefined ? body.ntsNo : existing.ntsNo,
      memo: body.memo !== undefined ? body.memo : existing.memo,
      issuedAt: status === TaxInvoiceStatus.issued ? new Date() : existing.issuedAt,
    },
  });
  return NextResponse.json({ ok: true });
}
