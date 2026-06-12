'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['일반', '주문/결제', '배송', '교환/반품', '복지용구', '기타'] as const;

type InquiryFormProps = {
  defaultPhone?: string;
};

export default function InquiryForm({ defaultPhone = '' }: InquiryFormProps) {
  const router = useRouter();
  const [category, setCategory] = useState<string>('일반');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [phone, setPhone] = useState(defaultPhone);
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrMsg('');

    if (!title.trim() || !content.trim()) {
      setErrMsg('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/cozycare/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, title: title.trim(), content: content.trim(), phone: phone.trim() }),
      });
      if (!res.ok) {
        setErrMsg('문의 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.');
        return;
      }
      setTitle('');
      setContent('');
      router.refresh();
    } catch {
      setErrMsg('문의 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        background: '#fff',
        border: '1px solid var(--gray-200, #e5e7eb)',
        borderRadius: '12px',
        padding: '24px',
      }}
    >
      {errMsg && (
        <div style={{ color: 'var(--red-600, #dc2626)', fontSize: '13px', fontWeight: 600 }}>{errMsg}</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-700, #374151)' }}>문의 유형</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            height: '40px',
            padding: '0 12px',
            border: '1px solid var(--gray-200, #e5e7eb)',
            borderRadius: '8px',
            fontSize: '14px',
            background: '#fff',
          }}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-700, #374151)' }}>제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="문의 제목을 입력해 주세요"
          required
          style={{
            height: '40px',
            padding: '0 12px',
            border: '1px solid var(--gray-200, #e5e7eb)',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-700, #374151)' }}>연락처</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="010-0000-0000"
          style={{
            height: '40px',
            padding: '0 12px',
            border: '1px solid var(--gray-200, #e5e7eb)',
            borderRadius: '8px',
            fontSize: '14px',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-700, #374151)' }}>내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="문의하실 내용을 자세히 입력해 주세요"
          required
          rows={6}
          style={{
            padding: '12px',
            border: '1px solid var(--gray-200, #e5e7eb)',
            borderRadius: '8px',
            fontSize: '14px',
            resize: 'vertical',
            lineHeight: 1.6,
          }}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        style={{
          height: '46px',
          background: 'var(--green-700, #15803d)',
          color: '#fff',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 700,
          cursor: submitting ? 'default' : 'pointer',
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? '등록 중...' : '1:1 문의 등록'}
      </button>
    </form>
  );
}
