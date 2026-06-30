import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  CalendarIcon,
  ListIcon,
  CheckSquareIcon,
  BellIcon,
  UsersIcon,
} from './Icons';
import styles from './Layout.module.css';

const TABS = [
  { to: '/', label: '캘린더', Icon: CalendarIcon, end: true },
  { to: '/schedules', label: '일정', Icon: ListIcon, end: false },
  { to: '/plans', label: '계획표', Icon: CheckSquareIcon, end: false },
  { to: '/reminders', label: '리마인더', Icon: BellIcon, end: false },
  { to: '/us', label: '우리', Icon: UsersIcon, end: false },
];

interface Props {
  title: ReactNode;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
}

export default function Layout({ title, subtitle, right, children }: Props) {
  useLocation(); // 경로 변경 시 active 갱신
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.hdRow}>
          <div>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {right}
        </div>
      </header>

      <main className={styles.screen}>{children}</main>

      <nav className={styles.tabbar}>
        {TABS.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
          >
            <Icon size={23} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
