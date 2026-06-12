export type RoleKey = 'superadmin' | 'ordermanager' | 'reviewer' | 'productmanager' | 'cs';

export type MatrixRow = Record<RoleKey, boolean>;

export const PERMISSION_LABELS: string[] = [
  '상품 등록·수정',
  '카테고리 관리 (보행기·휠체어·목욕의자 등)',
  '주문 조회·처리',
  '복지용구 서류 검토 / 공단 확인',
  '송장 등록·출고',
  '일반 회원 관리',
  '사업자 회원 4종 승인·도매가',
  '포인트 적립·차감',
  '매출 통계 / 정산 데이터',
  '사이트 설정·관리자 권한',
  '환불 접수·처리 (공단 확인 불가 환불)',
  '상품평·Q&A·1:1문의 응대',
  '공지·이벤트·FAQ 관리',
  '알림톡·SMS 템플릿 관리',
  '세금계산서 발행',
  '사업자 견적·대량주문 처리',
];

const T = true;
const F = false;

export const DEFAULT_MATRIX: MatrixRow[] = [
  { superadmin: T, ordermanager: F, reviewer: F, productmanager: T, cs: F },
  { superadmin: T, ordermanager: F, reviewer: F, productmanager: T, cs: F },
  { superadmin: T, ordermanager: T, reviewer: F, productmanager: F, cs: T },
  { superadmin: T, ordermanager: F, reviewer: T, productmanager: F, cs: F },
  { superadmin: T, ordermanager: T, reviewer: F, productmanager: F, cs: F },
  { superadmin: T, ordermanager: F, reviewer: F, productmanager: F, cs: T },
  { superadmin: T, ordermanager: T, reviewer: F, productmanager: F, cs: F },
  { superadmin: T, ordermanager: T, reviewer: F, productmanager: F, cs: T },
  { superadmin: T, ordermanager: T, reviewer: F, productmanager: F, cs: F },
  { superadmin: T, ordermanager: F, reviewer: F, productmanager: F, cs: F },
  { superadmin: T, ordermanager: T, reviewer: F, productmanager: F, cs: T },
  { superadmin: T, ordermanager: F, reviewer: F, productmanager: F, cs: T },
  { superadmin: T, ordermanager: F, reviewer: F, productmanager: F, cs: T },
  { superadmin: T, ordermanager: F, reviewer: F, productmanager: F, cs: T },
  { superadmin: T, ordermanager: T, reviewer: F, productmanager: F, cs: F },
  { superadmin: T, ordermanager: T, reviewer: F, productmanager: F, cs: F },
];

export const ROLE_COLUMN_KEYS: RoleKey[] = [
  'superadmin',
  'ordermanager',
  'reviewer',
  'productmanager',
  'cs',
];

export const ROLE_KEY_BY_COLUMN: Record<RoleKey, string> = {
  superadmin: 'super',
  ordermanager: 'order_manager',
  reviewer: 'reviewer',
  productmanager: 'product_manager',
  cs: 'cs',
};

export const PERMISSION_KEYS: string[] = [
  'product.manage',
  'category.manage',
  'order.manage',
  'welfare.review',
  'shipping.manage',
  'user.manage',
  'biz.manage',
  'point.manage',
  'settlement.read',
  'settings.manage',
  'refund.manage',
  'review.manage',
  'board.manage',
  'notification.manage',
  'tax.manage',
  'quote.manage',
];

export type AdminRoleData = {
  key: string;
  name: string;
  permissions: string[];
  otpRequired: boolean;
};

function parsePermissionList(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p): p is string => typeof p === 'string');
  } catch {
    return [];
  }
}

export function rolesToMatrix(
  roles: Array<{ key: string; permissions: string }>
): MatrixRow[] {
  const permsByRoleKey = new Map<string, string[]>();
  for (const r of roles) {
    permsByRoleKey.set(r.key, parsePermissionList(r.permissions));
  }

  return PERMISSION_KEYS.map((permKey, i) => {
    const fallback = DEFAULT_MATRIX[i];
    const cell = (column: RoleKey): boolean => {
      const roleKey = ROLE_KEY_BY_COLUMN[column];
      const perms = permsByRoleKey.get(roleKey);
      if (!perms) return fallback[column];
      return perms.includes('*') || perms.includes(permKey);
    };
    return {
      superadmin: cell('superadmin'),
      ordermanager: cell('ordermanager'),
      reviewer: cell('reviewer'),
      productmanager: cell('productmanager'),
      cs: cell('cs'),
    };
  });
}

export function matrixToPermissions(matrix: MatrixRow[], column: RoleKey): string[] {
  if (column === 'superadmin') return ['*'];
  const perms: string[] = [];
  matrix.forEach((row, i) => {
    if (row[column]) perms.push(PERMISSION_KEYS[i]);
  });
  return perms;
}

export function parseMatrix(raw: string | undefined): MatrixRow[] {
  if (!raw) return DEFAULT_MATRIX.map((r) => ({ ...r }));
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length !== DEFAULT_MATRIX.length) {
      return DEFAULT_MATRIX.map((r) => ({ ...r }));
    }
    return parsed.map((row, i) => {
      const fallback = DEFAULT_MATRIX[i];
      const r = (row ?? {}) as Partial<MatrixRow>;
      return {
        superadmin: typeof r.superadmin === 'boolean' ? r.superadmin : fallback.superadmin,
        ordermanager: typeof r.ordermanager === 'boolean' ? r.ordermanager : fallback.ordermanager,
        reviewer: typeof r.reviewer === 'boolean' ? r.reviewer : fallback.reviewer,
        productmanager: typeof r.productmanager === 'boolean' ? r.productmanager : fallback.productmanager,
        cs: typeof r.cs === 'boolean' ? r.cs : fallback.cs,
      };
    });
  } catch {
    return DEFAULT_MATRIX.map((r) => ({ ...r }));
  }
}
