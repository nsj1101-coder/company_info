'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const logout = async (): Promise<void> => {
    if (busy) return;
    setBusy(true);
    try {
      await fetch('/cozycare/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      style={{
        marginTop: 14,
        padding: '7px 16px',
        fontSize: 13,
        fontWeight: 700,
        color: '#fff',
        background: 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.32)',
        borderRadius: 999,
        cursor: busy ? 'default' : 'pointer',
        opacity: busy ? 0.6 : 1,
      }}
    >
      {busy ? '로그아웃 중…' : '로그아웃'}
    </button>
  );
}
