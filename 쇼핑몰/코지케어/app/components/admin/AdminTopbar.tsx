'use client';

import Link from 'next/link';
import { useState } from 'react';

type Notification = {
  id: string;
  category: string;
  categoryColor: string;
  categoryBg: string;
  dotColor: string;
  time: string;
  text: string;
  unread: boolean;
};

const DUMMY_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    category: '복지용구 검토',
    categoryColor: '#ef4444',
    categoryBg: '#FEE2E2',
    dotColor: '#ef4444',
    time: '10분 전',
    text: '김○○ 인정번호 서류 검토 요청',
    unread: true,
  },
  {
    id: 'n2',
    category: '결제 완료',
    categoryColor: '#34C759',
    categoryBg: '#EEFBF0',
    dotColor: '#84c140',
    time: '1시간 전',
    text: '박○○ 휠체어 EZ-1 결제 완료',
    unread: true,
  },
  {
    id: 'n3',
    category: '사업자 승인',
    categoryColor: '#FF9500',
    categoryBg: '#FFF8EE',
    dotColor: '#FF9500',
    time: '3시간 전',
    text: '㈜이로움파트너 신규 가입 대기',
    unread: false,
  },
];

export default function AdminTopbar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const [bellOpen, setBellOpen] = useState(false);

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="top-bar-right">
        <div className="search-box">
          <i className="icon-search search-icon" />
          <input type="text" placeholder="검색..." />
        </div>
        <div className="bell-wrapper">
          <button
            type="button"
            className="bell-btn"
            onClick={() => setBellOpen((v) => !v)}
          >
            <i className="icon-bell" style={{ color: '#4B5563', fontSize: 18 }} />
            <span className="bell-dot" />
          </button>
          {bellOpen && (
            <div className="noti-dropdown" style={{ display: 'block' }}>
              <div className="noti-header">
                <span className="noti-title">알림</span>
                <span className="noti-read-all">모두 읽음</span>
              </div>
              {DUMMY_NOTIFICATIONS.map((n) => (
                <div
                  key={n.id}
                  className={`noti-item${n.unread ? ' unread' : ''}`}
                >
                  <div className="noti-dot" style={{ background: n.dotColor }} />
                  <div className="noti-body">
                    <span
                      className="noti-badge"
                      style={{ background: n.categoryBg, color: n.categoryColor }}
                    >
                      {n.category}
                    </span>
                    <span className="noti-time">{n.time}</span>
                    <div className="noti-text">{n.text}</div>
                  </div>
                </div>
              ))}
              <Link href="/admin/shipping" className="noti-footer">
                알림 센터 전체 보기 →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
