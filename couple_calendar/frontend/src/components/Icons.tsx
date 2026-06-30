// 단색 라인 아이콘 (흑백, currentColor 사용)
interface P {
  size?: number;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const CalendarIcon = ({ size = 24 }: P) => (
  <svg {...base(size)}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
  </svg>
);

export const ListIcon = ({ size = 24 }: P) => (
  <svg {...base(size)}>
    <path d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01" />
  </svg>
);

export const CheckSquareIcon = ({ size = 24 }: P) => (
  <svg {...base(size)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
    <path d="M8 12l2.5 2.5L16 9" />
  </svg>
);

export const BellIcon = ({ size = 24 }: P) => (
  <svg {...base(size)}>
    <path d="M18 8.5a6 6 0 1 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5M13.5 19.5a1.8 1.8 0 0 1-3 0" />
  </svg>
);

export const UsersIcon = ({ size = 24 }: P) => (
  <svg {...base(size)}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
    <path d="M16 6.2a3 3 0 0 1 0 5.6M16.5 14.7c2.4.4 4 2.3 4 4.8" />
  </svg>
);

export const PlusIcon = ({ size = 24 }: P) => (
  <svg {...base(size)} strokeWidth={2}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const ChevronRightIcon = ({ size = 20 }: P) => (
  <svg {...base(size)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const CloseIcon = ({ size = 22 }: P) => (
  <svg {...base(size)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const PinIcon = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.4" />
  </svg>
);

export const ClockIcon = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const MemoIcon = ({ size = 18 }: P) => (
  <svg {...base(size)}>
    <path d="M5 4.5h14v15H5zM8.5 9h7M8.5 13h7M8.5 17h4" />
  </svg>
);
