'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LIST_STYLES } from '@/components/admin/listStyles';

export type TemplateView = {
  id: number;
  code: string;
  name: string;
  channel: string;
  trigger: string;
  content: string;
  enabled: boolean;
};

const CHANNEL_META: Record<string, { label: string; cls: string }> = {
  kakao: { label: '알림톡', cls: 'st-amber' },
  sms: { label: 'SMS', cls: 'st-blue' },
  email: { label: '이메일', cls: 'st-navy' },
};

type FormState = { id: number | null; code: string; name: string; channel: string; trigger: string; content: string; enabled: boolean };
const EMPTY: FormState = { id: null, code: '', name: '', channel: 'kakao', trigger: '', content: '', enabled: true };

export default function NotificationTemplatesClient({ rows }: { rows: TemplateView[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const seed = async (): Promise<void> => {
    await fetch('/cozycare/api/notification-templates', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'seed' }),
    });
    router.refresh();
  };

  const toggle = async (t: TemplateView): Promise<void> => {
    await fetch(`/cozycare/api/notification-templates/${t.id}`, {
      method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ enabled: !t.enabled }),
    });
    router.refresh();
  };

  const save = async (): Promise<void> => {
    if (!form) return;
    setErr('');
    if (!form.code.trim() || !form.name.trim() || !form.content.trim()) { setErr('코드·이름·내용은 필수입니다.'); return; }
    setSaving(true);
    try {
      const isNew = form.id === null;
      const res = await fetch(`/cozycare/api/notification-templates${isNew ? '' : `/${form.id}`}`, {
        method: isNew ? 'POST' : 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code: form.code, name: form.name, channel: form.channel, trigger: form.trigger, content: form.content, enabled: form.enabled }),
      });
      if (!res.ok) { const j = (await res.json().catch(() => ({}))) as { error?: string }; setErr(j.error ?? '저장 실패'); return; }
      setForm(null);
      router.refresh();
    } finally { setSaving(false); }
  };

  return (
    <>
      <style>{LIST_STYLES}</style>
      <div className="top-bar">
        <div className="top-bar-left"><h1>알림톡 템플릿</h1><p>주문 단계별 카카오 알림톡·SMS 자동발송 문구 관리</p></div>
        <div className="top-bar-right">
          <button className="btn btn-dark" onClick={() => { setErr(''); setForm({ ...EMPTY }); }}>+ 템플릿 추가</button>
        </div>
      </div>

      <div className="content-scroll" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="lp-grid">
          <div className="toolbar">
            <span className="ag-muted" style={{ fontSize: 13 }}>변수: <code>{'{{이름}} {{주문번호}} {{상품명}} {{송장번호}}'}</code> 사용 가능</span>
            {rows.length === 0 && <button className="btn-sm primary" onClick={seed}>기본 템플릿 생성</button>}
          </div>
        </div>

        <div className="table-wrap">
          <div className="info-bar"><span className="info-txt">총 {rows.length}건</span></div>
          <div className="ag-table-scroll">
            <table className="ag-table">
              <colgroup><col style={{ width: '150px' }} /><col style={{ width: '90px' }} /><col style={{ width: '140px' }} /><col /><col style={{ width: '80px' }} /><col style={{ width: '120px' }} /></colgroup>
              <thead><tr><th>템플릿명</th><th>채널</th><th>발송 시점</th><th>내용</th><th>사용</th><th>처리</th></tr></thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id}>
                    <td className="ag-name">{t.name}<div className="ag-muted" style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}>{t.code}</div></td>
                    <td><span className={`st-badge ${CHANNEL_META[t.channel]?.cls ?? 'st-gray'}`}>{CHANNEL_META[t.channel]?.label ?? t.channel}</span></td>
                    <td className="ag-muted">{t.trigger || '-'}</td>
                    <td className="ag-clip">{t.content}</td>
                    <td><span className={`st-badge ${t.enabled ? 'st-green' : 'st-gray'}`}>{t.enabled ? 'ON' : 'OFF'}</span></td>
                    <td><div className="row-actions">
                      <button className="btn-sm primary" onClick={() => { setErr(''); setForm({ id: t.id, code: t.code, name: t.name, channel: t.channel, trigger: t.trigger, content: t.content, enabled: t.enabled }); }}>수정</button>
                      <button className="btn-sm" onClick={() => toggle(t)}>{t.enabled ? 'OFF' : 'ON'}</button>
                    </div></td>
                  </tr>
                ))}
                {rows.length === 0 && <tr><td colSpan={6} className="empty-row">템플릿이 없습니다. &apos;기본 템플릿 생성&apos;을 눌러보세요.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="ag-pag"><span className="pag-info">총 {rows.length}건</span></div>
        </div>
      </div>

      {form && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-content modal-wide">
            <div className="modal-title" style={{ textAlign: 'left' }}>{form.id === null ? '템플릿 추가' : '템플릿 수정'}</div>
            <div className="mform" style={{ marginTop: 12 }}>
              <div className="row2">
                <div className="fld"><label>코드</label><input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="order_paid" disabled={form.id !== null} /></div>
                <div className="fld"><label>템플릿명</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="결제 완료 안내" /></div>
              </div>
              <div className="row2">
                <div className="fld"><label>채널</label><select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}><option value="kakao">알림톡</option><option value="sms">SMS</option><option value="email">이메일</option></select></div>
                <div className="fld"><label>발송 시점</label><input type="text" value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })} placeholder="결제완료 / 출고 등" /></div>
              </div>
              <div className="fld"><label>내용</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="{{이름}}님, 주문 {{주문번호}}가 접수되었습니다." style={{ minHeight: 120 }} /></div>
              {err && <span style={{ color: '#ef4444', fontSize: 13 }}>{err}</span>}
            </div>
            <div className="modal-actions" style={{ marginTop: 16 }}>
              <button className="btn btn-secondary" onClick={() => setForm(null)}>취소</button>
              <button className="btn btn-dark" onClick={save} disabled={saving}>{saving ? '저장중...' : '저장'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
