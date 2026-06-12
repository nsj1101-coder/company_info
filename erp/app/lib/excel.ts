import * as XLSX from "xlsx";

// 엑셀 파싱 공용 모듈 — 시드 임포트와 업로드 기능이 공유.
// 컬럼은 위치(index) 기준 매핑 (01_시트분석.md의 확정 헤더 순서).

export type Row = (string | number | boolean | Date | null)[];

export function sheetRows(ws: XLSX.WorkSheet): Row[] {
  return XLSX.utils.sheet_to_json<Row>(ws, { header: 1, raw: true, defval: null, blankrows: false });
}

export function readWorkbookFromBuffer(buf: Buffer): XLSX.WorkBook {
  return XLSX.read(buf, { type: "buffer", cellDates: true });
}

export function readWorkbookFromFile(path: string): XLSX.WorkBook {
  return XLSX.readFile(path, { cellDates: true });
}

// ── 값 변환 헬퍼 ────────────────────────────────────────────
export function toStr(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

export function toInt(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return Math.round(v);
  const cleaned = String(v).replace(/[^0-9.\-]/g, "");
  if (cleaned === "" || cleaned === "-") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? Math.round(n) : null;
}

export function toFloat(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return v;
  const cleaned = String(v).replace(/[^0-9.\-]/g, "");
  if (cleaned === "" || cleaned === "-") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function toDate(v: unknown): Date | null {
  if (v === null || v === undefined || v === "") return null;
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  const s = String(v).trim();
  // "2026- 2- 4" 같은 변형 정리
  const norm = s.replace(/\s+/g, "").replace(/[./]/g, "-");
  const d = new Date(norm);
  return isNaN(d.getTime()) ? null : d;
}

const g = (r: Row, i: number) => (i < r.length ? r[i] : null);

// 이모지/기호 제거 + 공백 정리 (엑셀의 "🏥 B2B" → "B2B")
function stripEmoji(s: string): string {
  return s
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normChannel(v: unknown): string | null {
  const s = toStr(v);
  if (!s) return null;
  const c = stripEmoji(s);
  return c === "" ? null : c;
}

export function normStatus(v: unknown): string | null {
  const s = toStr(v);
  if (!s) return null;
  const c = stripEmoji(s);
  if (!c) return null;
  if (c.includes("반품") || c.includes("취소")) return "반품/취소";
  if (c.includes("출고완료") || c.includes("출고")) return "출고완료";
  if (c.includes("생산")) return "생산중";
  if (c.includes("자수")) return "자수대기";
  if (c.includes("접수")) return "접수";
  return c;
}

// ── 마스터/운영 시트 파서 (위치 기반) ──────────────────────

export function parseProducts(rows: Row[]) {
  return rows.slice(1).map((r) => ({
    name: toStr(g(r, 0)) ?? "",
    sku: toStr(g(r, 1)),
    category: toStr(g(r, 2)),
    color: toStr(g(r, 3)),
    size: toStr(g(r, 4)),
    cost: toInt(g(r, 5)),
    priceConsumer: toInt(g(r, 6)),
    priceOnline: toInt(g(r, 7)),
    priceB2B: toInt(g(r, 8)),
    priceWholesaleUsd: toFloat(g(r, 9)),
    priceRetailUsd: toFloat(g(r, 10)),
    priceWholesaleJpy: toFloat(g(r, 11)),
    priceRetailJpy: toFloat(g(r, 12)),
    priceDealer: toInt(g(r, 13)),
    safeStock: toInt(g(r, 14)) ?? 0,
  })).filter((p) => p.sku);
}

export function parseCustomers(rows: Row[]) {
  return rows.slice(1).map((r) => ({
    code: toStr(g(r, 0)),
    name: toStr(g(r, 1)) ?? "",
    type: toStr(g(r, 2)),
    channel: toStr(g(r, 3)),
    manager: toStr(g(r, 4)),
    phone: toStr(g(r, 5)),
    email: toStr(g(r, 6)),
    region: toStr(g(r, 7)),
    note: toStr(g(r, 8)),
  })).filter((c) => c.code && c.name);
}

export function parseOrders(rows: Row[]) {
  return rows.slice(1).map((r) => {
    const qty = toInt(g(r, 8)) ?? 0;
    const unitPrice = toInt(g(r, 9)) ?? 0;
    const returnQty = toInt(g(r, 11)) ?? 0;
    return {
      orderNo: toStr(g(r, 0)) ?? "",
      orderDate: toDate(g(r, 1)),
      customerCode: toStr(g(r, 2)),
      customerName: toStr(g(r, 3)),
      customerType: normChannel(g(r, 4)),
      channel: normChannel(g(r, 5)),
      sku: toStr(g(r, 6)),
      productName: toStr(g(r, 7)),
      qty,
      unitPrice,
      totalAmount: toInt(g(r, 10)) ?? qty * unitPrice,
      returnQty,
      netQty: toInt(g(r, 12)) ?? qty - returnQty,
      status: normStatus(g(r, 13)),
    };
  }).filter((o) => o.orderNo);
}

export function parseInventory(rows: Row[]) {
  return rows.slice(1).map((r) => ({
    brand: toStr(g(r, 0)),
    item: toStr(g(r, 1)),
    season: toStr(g(r, 2)),
    productName: toStr(g(r, 3)),
    color: toStr(g(r, 4)),
    size: toStr(g(r, 5)),
    sku: toStr(g(r, 6)),
    initialStock: toInt(g(r, 7)) ?? 0,
    inbound: toInt(g(r, 8)) ?? 0,
    outbound: toInt(g(r, 9)) ?? 0,
    currentStock: toInt(g(r, 10)) ?? 0,
    safeStock: toInt(g(r, 11)) ?? 0,
    status: toStr(g(r, 12)),
    shortageQty: toInt(g(r, 13)) ?? 0,
    recommendQty: toInt(g(r, 14)) ?? 0,
    keepQty: toInt(g(r, 15)) ?? 0,
  })).filter((i) => i.sku);
}

export function parseProduction(rows: Row[]) {
  return rows.slice(1).map((r) => ({
    prodNo: toStr(g(r, 0)) ?? "",
    orderManager: toStr(g(r, 1)),
    prodDate: toDate(g(r, 2)),
    sku: toStr(g(r, 3)),
    brand: toStr(g(r, 4)),
    productName: toStr(g(r, 5)),
    color: toStr(g(r, 6)),
    size: toStr(g(r, 7)),
    orderQty: toInt(g(r, 8)) ?? 0,
    prodQty: toInt(g(r, 9)) ?? 0,
    defectQty: toInt(g(r, 10)) ?? 0,
    inboundQty: toInt(g(r, 11)) ?? 0,
    ceoConfirm: toStr(g(r, 12)),
    expectedInDate: toDate(g(r, 13)),
    inDate: toDate(g(r, 14)),
    prodManager: toStr(g(r, 15)),
    factory: toStr(g(r, 16)),
    note: toStr(g(r, 17)),
    leadTime: toInt(g(r, 18)),
    delayed: toStr(g(r, 19)),
    linkedOrderNo: toStr(g(r, 20)),
  })).filter((p) => p.prodNo);
}

export function parsePurchase(rows: Row[]) {
  return rows.slice(1).map((r) => ({
    poNo: toStr(g(r, 0)) ?? "",
    poDate: toDate(g(r, 1)),
    sku: toStr(g(r, 2)),
    productName: toStr(g(r, 3)),
    orderQty: toInt(g(r, 4)) ?? 0,
    supplier: toStr(g(r, 5)),
    rawMaterial: toStr(g(r, 6)),
    processing: toStr(g(r, 7)),
    fullPurchase: toStr(g(r, 8)),
    expectedInDate: toDate(g(r, 9)),
    inboundConfirm: toStr(g(r, 10)),
    note: toStr(g(r, 11)),
  })).filter((p) => p.poNo);
}

export function parseReturns(rows: Row[]) {
  return rows.slice(1).map((r) => ({
    returnNo: toStr(g(r, 0)) ?? "",
    returnDate: toDate(g(r, 1)),
    returnPlace: toStr(g(r, 2)),
    orderNo: toStr(g(r, 3)),
    sku: toStr(g(r, 4)),
    productName: toStr(g(r, 5)),
    color: toStr(g(r, 6)),
    size: toStr(g(r, 7)),
    returnQty: toInt(g(r, 8)) ?? 0,
    reason: toStr(g(r, 9)),
  })).filter((r) => r.returnNo && r.returnNo !== "R");
}

// ── 원천 주문(카페_26 / 주문서_26) 파서 — 업로드 기능 공용 ──
export function parseRawOrders(rows: Row[], sheetType: "cafe" | "offline") {
  return rows.slice(1).map((r) => ({
    sheetType,
    source: toStr(g(r, 0)),
    shipStatus: toStr(g(r, 2)),
    shipDate: toStr(g(r, 3)),
    orderNo: toStr(g(r, 4)),
    orderedAt: toStr(g(r, 5)),
    ordererName: toStr(g(r, 6)),
    address: toStr(g(r, 7)),
    payMethod: toStr(g(r, 8)),
    payer: toStr(g(r, 9)),
    productName: toStr(g(r, 10)),
    option: toStr(g(r, 11)),
    qty: toInt(g(r, 12)),
    optionPrice: toInt(g(r, 13)),
    purchaseAmount: toInt(g(r, 14)),
    usedPoint: toInt(g(r, 15)),
    finalPayAmount: toInt(g(r, 16)),
    refundAmount: toInt(g(r, 17)),
    totalPayAmount: toInt(g(r, 18)),
    phone: toStr(g(r, 19)),
    orderMonth: toStr(g(r, 20)),
    channel: normChannel(g(r, 21)),
    orderStatus: normStatus(g(r, 22)),
    production: toStr(g(r, 23)),
    embroidery: toStr(g(r, 24)),
    returnFlag: toStr(g(r, 25)),
    customerCode: toStr(g(r, 26)),
  })).filter((o) => o.orderNo || o.payer || o.productName);
}
