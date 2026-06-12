import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import NotificationForm, { type ChannelState, type NotificationRow } from './NotificationForm';

const DEFAULT_CHANNELS: ChannelState = { email: true, kakao: true, sms: true };

const CHANNEL_LABELS: Record<string, string> = {
  sms: 'SMS',
  kakao: '카카오 알림톡',
  email: '이메일',
};

function formatSentAt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${day} ${hh}:${mm}`;
}

function parseChannels(raw: string | undefined): ChannelState {
  if (!raw) return DEFAULT_CHANNELS;
  try {
    const parsed = JSON.parse(raw) as Partial<ChannelState>;
    return {
      email: typeof parsed.email === 'boolean' ? parsed.email : DEFAULT_CHANNELS.email,
      kakao: typeof parsed.kakao === 'boolean' ? parsed.kakao : DEFAULT_CHANNELS.kakao,
      sms: typeof parsed.sms === 'boolean' ? parsed.sms : DEFAULT_CHANNELS.sms,
    };
  } catch {
    return DEFAULT_CHANNELS;
  }
}

export default async function Page() {
  const session = await getCurrentSession();
  if (!session || session.role !== 'admin') {
    redirect('/admin/login');
  }

  const [row, notifications] = await Promise.all([
    prisma.setting.findUnique({ where: { key: 'notification.channels' } }),
    prisma.notification.findMany({ orderBy: { sentAt: 'desc' }, take: 20 }),
  ]);
  const channels = parseChannels(row?.value);

  const history: NotificationRow[] = notifications.map((n) => ({
    id: n.id,
    audience: n.audience,
    channelLabel: CHANNEL_LABELS[n.channel] ?? n.channel,
    template: n.template,
    memo: n.memo ?? '',
    sentAt: formatSentAt(n.sentAt),
  }));

  return <NotificationForm channels={channels} history={history} />;
}
