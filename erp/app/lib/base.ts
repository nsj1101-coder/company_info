// 클라이언트 fetch는 basePath를 자동으로 안 붙으므로 수동 prefix.
// (next/link, router.push 는 자동 처리되어 불필요)
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
