// Lucide 정적 SVG → mask-image data URI CSS 생성 (마크업 무변경, currentColor 테마)
// 실행: node scripts/gen-icons.mjs  → app/icons.css 생성
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ICONS_DIR = path.join(ROOT, 'node_modules/lucide-static/icons');
const OUT = path.join(ROOT, 'app/icons.css');

// 코드에서 실제 사용하는 icon-* 이름(레이아웃 클래스 icon-btn/icon-bg 제외)
const NAMES = [
  'alert-circle','alert-triangle','armchair','arrow-left','arrow-right','arrow-up','arrow-up-down',
  'banknote','bath','bed-double','bell','calculator','calendar','chart-bar','check','check-circle',
  'chevron-left','chevron-right','circle-help','clipboard-list','clock','coins','database','download',
  'ellipsis','external-link','eye','file-image','file-text','filter','folder','footprints','globe',
  'grip-vertical','handshake','headphones','history','home','layout-dashboard','lock','log-in','log-out',
  'map-pin','megaphone','message-circle','message-square','messages-square','package','package-x',
  'panel-left-close','pencil','pin','plus','printer','receipt','refund','rotate-ccw','search','send',
  'settings','shield','shield-alert','shield-check','shopping-cart','star','store','tags','toilet',
  'trash-2','trending-down','trending-up','truck','upload','upload-cloud','user','user-check','users',
  'wallet','x','x-circle',
];

// Lucide 개명/커스텀 별칭 (요청이름 → 후보 파일명 우선순위)
const ALIAS = {
  'refund': ['rotate-ccw'],
  'x-circle': ['circle-x', 'x-circle'],
  'alert-circle': ['circle-alert', 'alert-circle'],
  'alert-triangle': ['triangle-alert', 'alert-triangle'],
  'check-circle': ['circle-check', 'check-circle'],
  'circle-help': ['circle-help', 'help-circle'],
  'chart-bar': ['chart-bar', 'bar-chart'],
  'ellipsis': ['ellipsis', 'more-horizontal'],
};

function resolveFile(name) {
  const candidates = (ALIAS[name] ? [...ALIAS[name]] : []);
  candidates.push(name);
  for (const c of candidates) {
    const f = path.join(ICONS_DIR, `${c}.svg`);
    if (fs.existsSync(f)) return f;
  }
  return null;
}

function toDataUri(svg) {
  const min = svg.replace(/\r?\n/g, '').replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim();
  return `data:image/svg+xml,${encodeURIComponent(min)}`;
}

const base = `/* 자동 생성 (scripts/gen-icons.mjs) — Lucide 아이콘 mask. 수정 금지, 재생성으로 갱신 */
[class^="icon-"]:not(.icon-btn):not(.icon-bg),
[class*=" icon-"]:not(.icon-btn):not(.icon-bg){
  display:inline-block;width:1em;height:1em;vertical-align:-0.125em;
  background-color:currentColor;flex-shrink:0;
  -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;
  -webkit-mask-position:center;mask-position:center;
  -webkit-mask-size:contain;mask-size:contain;
}
`;

const rules = [];
const missing = [];
for (const name of NAMES) {
  const file = resolveFile(name);
  if (!file) { missing.push(name); continue; }
  const uri = toDataUri(fs.readFileSync(file, 'utf8'));
  rules.push(`.icon-${name}{-webkit-mask-image:url("${uri}");mask-image:url("${uri}")}`);
}

fs.writeFileSync(OUT, base + rules.join('\n') + '\n', 'utf8');
console.log(`✅ icons.css 생성: ${rules.length}개 아이콘`);
if (missing.length) console.warn(`⚠️ 누락(파일 못 찾음): ${missing.join(', ')}`);
