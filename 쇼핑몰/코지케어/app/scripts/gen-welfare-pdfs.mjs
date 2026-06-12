import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

// 주문별 장기요양인정서 데이터 (실제 DB와 동일)
const ORDERS = [
  { id: 449, orderNo: 'OD-20260029', cert: 'L2025-1036', grade: 5, status: 'APPROVED', item: 'Mobility Walker (Wide)' },
  { id: 447, orderNo: 'OD-20260027', cert: 'L2025-0962', grade: 3, status: 'UNDER GOV REVIEW', item: 'Walking Cane (Cozy Stick)' },
  { id: 445, orderNo: 'OD-20260025', cert: 'L2025-0888', grade: 1, status: 'PENDING', item: 'Electric Care Bed (2-Motor)' },
  { id: 443, orderNo: 'OD-20260023', cert: 'L2025-0814', grade: 5, status: 'REJECTED', item: 'Bath Swivel Chair' },
  { id: 441, orderNo: 'OD-20260021', cert: 'L2025-0740', grade: 3, status: 'APPROVED', item: 'Cozy Walker P01' },
  { id: 439, orderNo: 'OD-20260019', cert: 'L2025-0666', grade: 1, status: 'UNDER GOV REVIEW', item: 'Wide Walker' },
  { id: 437, orderNo: 'OD-20260017', cert: 'L2025-0592', grade: 5, status: 'PENDING', item: 'Cozy Stick Cane' },
  { id: 435, orderNo: 'OD-20260015', cert: 'L2025-0518', grade: 3, status: 'REJECTED', item: 'Electric Care Bed (2-Motor)' },
  { id: 433, orderNo: 'OD-20260013', cert: 'L2025-0444', grade: 1, status: 'APPROVED', item: 'Portable Toilet' },
  { id: 431, orderNo: 'OD-20260011', cert: 'L2025-0370', grade: 5, status: 'UNDER GOV REVIEW', item: 'Wheelchair (Compact)' },
  { id: 429, orderNo: 'OD-20260009', cert: 'L2025-0296', grade: 3, status: 'PENDING', item: 'Wide Walker' },
  { id: 427, orderNo: 'OD-20260007', cert: 'L2025-0222', grade: 1, status: 'REJECTED', item: 'Carbon Walker' },
  { id: 425, orderNo: 'OD-20260005', cert: 'L2025-0148', grade: 5, status: 'APPROVED', item: 'Bath Swivel Chair' },
  { id: 423, orderNo: 'OD-20260003', cert: 'L2025-0074', grade: 3, status: 'UNDER GOV REVIEW', item: 'Cozy Walker P01' },
  { id: 421, orderNo: 'OD-20260001', cert: 'L2025-0000', grade: 1, status: 'PENDING', item: 'Wheelchair EZ-1' },
];

function esc(s) {
  return String(s).replace(/[\\()]/g, (m) => '\\' + m);
}

// 최소한의 유효한 단일 페이지 PDF (Helvetica) 생성
function makePdf(lines) {
  const objs = [];
  objs.push('<</Type/Catalog/Pages 2 0 R>>');
  objs.push('<</Type/Pages/Kids[3 0 R]/Count 1>>');
  objs.push('<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 5 0 R/F2 6 0 R>>>>/Contents 4 0 R>>');

  let body = 'BT\n';
  let y = 790;
  for (const ln of lines) {
    const font = ln.bold ? 'F2' : 'F1';
    const size = ln.size ?? 11;
    body += `/${font} ${size} Tf\n1 0 0 1 60 ${y} Tm (${esc(ln.t)}) Tj\n`;
    y -= ln.gap ?? 20;
  }
  body += 'ET\n';
  objs.push(`<</Length ${body.length}>>\nstream\n${body}endstream`);
  objs.push('<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>');
  objs.push('<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold>>');

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objs.forEach((o, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((off) => {
    pdf += String(off).padStart(10, '0') + ' 00000 n \n';
  });
  pdf += `trailer\n<</Size ${objs.length + 1}/Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, 'latin1');
}

const outDir = 'public/uploads/welfare';
mkdirSync(outDir, { recursive: true });

for (const o of ORDERS) {
  const lines = [
    { t: 'LONG-TERM CARE CERTIFICATE', bold: true, size: 20, gap: 14 },
    { t: 'National Health Insurance Service (NHIS)', size: 11, gap: 10 },
    { t: 'Jangki-yoyang Recognition Certificate', size: 10, gap: 24 },
    { t: '----------------------------------------------------------', gap: 22 },
    { t: `Certificate No.   :  ${o.cert}`, bold: true, gap: 22 },
    { t: `Care Grade        :  Level ${o.grade}`, bold: true, gap: 22 },
    { t: 'Recipient         :  (protected / on file)', gap: 22 },
    { t: 'Valid Period      :  2026-01-01 ~ 2027-12-31', gap: 22 },
    { t: `Welfare Item      :  ${o.item}`, gap: 22 },
    { t: 'Co-payment Rate   :  15%', gap: 22 },
    { t: 'Reviewer          :  Cozycare Admin', gap: 22 },
    { t: `Review Status     :  ${o.status}`, bold: true, gap: 22 },
    { t: 'Issued            :  2025-12-20', gap: 28 },
    { t: '----------------------------------------------------------', gap: 22 },
    { t: 'This certifies the person above is a long-term care', gap: 16 },
    { t: 'beneficiary under the Long-Term Care Insurance Act.', gap: 30 },
    { t: `Document No. WR / Order ${o.orderNo}`, size: 9, gap: 14 },
    { t: '* Cozycare sales demo sample - no legal effect.', size: 9, gap: 14 },
  ];
  const buf = makePdf(lines);
  const path = `${outDir}/welfare-cert-${o.id}.pdf`;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, buf);
  console.log(`wrote ${path} (${buf.length} bytes)`);
}
console.log('DONE', ORDERS.length, 'pdfs');
