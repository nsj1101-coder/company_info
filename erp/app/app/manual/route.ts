import { NextResponse } from "next/server";

const A = "/lalune-erp/manual-assets"; // 스크린샷 경로

const shot = (file: string, cap: string) =>
  `<figure class="shot"><img src="${A}/${file}" alt="${cap}" loading="lazy"/><figcaption>${cap}</figcaption></figure>`;

const HTML = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<meta name="robots" content="noindex"/>
<title>라린느 통합 ERP — 사용 매뉴얼</title>
<link rel="preconnect" href="https://cdn.jsdelivr.net"/>
<style>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css');
:root{--ink:#16181d;--sub:#5b616e;--muted:#9aa0ac;--line:#e6e8ec;--bg:#fff;--soft:#f6f7f9;--brand:#2f3a8f;--brand-50:#eef0fb;--ok:#137a4b;--ok-50:#e7f6ee;--warn:#b45309;--warn-50:#fef6e7;--danger:#c5221f;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Pretendard Variable',Pretendard,-apple-system,system-ui,sans-serif;color:var(--ink);line-height:1.75;background:var(--soft);-webkit-font-smoothing:antialiased;}
.page{max-width:1080px;margin:0 auto;background:#fff;}
/* cover */
.cover{background:#111;color:#fff;padding:80px 64px 56px;}
.cover .badge{display:inline-block;border:1px solid rgba(255,255,255,.35);color:#cdd2e6;padding:5px 14px;border-radius:20px;font-size:12px;letter-spacing:.08em;margin-bottom:26px;}
.cover h1{font-size:42px;font-weight:800;letter-spacing:-.02em;line-height:1.2;}
.cover h1 b{color:#aab2ff;}
.cover p{color:rgba(255,255,255,.55);font-size:16px;margin-top:12px;}
.cover .meta{display:flex;gap:48px;margin-top:48px;padding-top:28px;border-top:1px solid rgba(255,255,255,.12);flex-wrap:wrap;}
.cover .meta div{font-size:13px;color:rgba(255,255,255,.5);}
.cover .meta strong{display:block;color:#fff;font-size:14px;margin-bottom:3px;}
/* login box */
.login{margin:0 64px;margin-top:-28px;background:#fff;border:1px solid var(--line);border-radius:14px;padding:22px 26px;box-shadow:0 18px 40px -24px rgba(0,0,0,.25);position:relative;}
.login h3{font-size:14px;color:var(--brand);margin-bottom:12px;}
.login .row{display:flex;gap:36px;flex-wrap:wrap;}
.login .row div{font-size:14px;}
.login .row b{display:block;font-size:12px;color:var(--muted);margin-bottom:2px;font-weight:600;}
.login .row code{font-family:ui-monospace,Menlo,monospace;background:var(--soft);padding:3px 8px;border-radius:6px;font-size:13.5px;}
.body{padding:48px 64px 80px;}
/* toc */
.toc{background:var(--soft);border:1px solid var(--line);border-radius:14px;padding:24px 26px;margin-bottom:48px;}
.toc h2{font-size:12px;letter-spacing:.12em;color:var(--muted);text-transform:uppercase;margin-bottom:16px;}
.toc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}
.toc-grid a{display:flex;gap:10px;align-items:center;padding:11px 14px;background:#fff;border:1px solid var(--line);border-radius:9px;text-decoration:none;color:var(--ink);font-size:13.5px;transition:.15s;}
.toc-grid a:hover{border-color:var(--brand);background:var(--brand-50);}
.toc-grid .n{width:24px;height:24px;background:#111;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;}
/* section */
section{margin-bottom:64px;scroll-margin-top:20px;}
.lbl{font-size:12px;letter-spacing:.1em;color:var(--brand);font-weight:700;text-transform:uppercase;margin-bottom:8px;}
h2.title{font-size:28px;font-weight:800;letter-spacing:-.02em;margin-bottom:8px;}
h3.sub{font-size:19px;font-weight:700;margin:32px 0 12px;padding-top:8px;}
p.desc{color:var(--sub);font-size:15.5px;margin-bottom:18px;}
.shot{margin:18px 0;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fff;box-shadow:0 8px 24px -18px rgba(0,0,0,.3);}
.shot img{width:100%;display:block;}
.shot figcaption{font-size:12.5px;color:var(--muted);padding:10px 14px;border-top:1px solid var(--line);background:var(--soft);}
ul,ol{margin:10px 0 16px 4px;padding-left:20px;}
li{margin-bottom:7px;font-size:15px;}
li b{color:var(--ink);}
.callout{display:flex;gap:12px;padding:14px 16px;border-radius:10px;margin:16px 0;font-size:14.5px;}
.callout .ic{flex-shrink:0;font-weight:800;}
.callout.next{background:var(--brand-50);color:#27306a;}
.callout.tip{background:var(--ok-50);color:#0f5c39;}
.callout.warn{background:var(--warn-50);color:#7a4708;}
table.kv{width:100%;border-collapse:collapse;margin:14px 0;font-size:14px;}
table.kv th,table.kv td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--line);vertical-align:top;}
table.kv th{background:var(--soft);color:var(--sub);font-weight:600;width:200px;white-space:nowrap;}
/* flow diagram */
.flow{background:#111;border-radius:14px;padding:30px;color:#fff;margin:20px 0;}
.flow .step{display:flex;align-items:center;gap:16px;margin-bottom:14px;}
.flow .num{width:30px;height:30px;border-radius:50%;background:#aab2ff;color:#111;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.flow .box{background:#1e2233;border:1px solid #2c3350;border-radius:10px;padding:12px 16px;flex:1;}
.flow .box b{color:#fff;}
.flow .box span{color:#9aa3c7;font-size:13.5px;}
.flow .arrow{text-align:left;color:#6b73a0;margin:2px 0 2px 14px;font-size:14px;}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;}
.chip{background:#1e2233;border:1px solid #2c3350;border-radius:8px;padding:6px 12px;font-size:13px;color:#cdd2e6;}
.scen{border:1px solid var(--line);border-radius:12px;padding:22px 24px;margin-bottom:20px;background:#fff;}
.scen .tag{display:inline-block;background:#111;color:#fff;font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;margin-bottom:10px;}
.scen h4{font-size:17px;margin-bottom:10px;}
.scen ol{counter-reset:s;list-style:none;padding-left:0;}
.scen ol li{counter-increment:s;position:relative;padding-left:34px;margin-bottom:9px;}
.scen ol li::before{content:counter(s);position:absolute;left:0;top:1px;width:22px;height:22px;background:var(--brand-50);color:var(--brand);border-radius:50%;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;}
.foot{background:#111;color:rgba(255,255,255,.6);padding:32px 64px;font-size:13px;text-align:center;}
@media(max-width:760px){.cover,.body,.login,.foot{padding-left:22px;padding-right:22px;}.login{margin-left:22px;margin-right:22px;}.toc-grid{grid-template-columns:1fr;}.cover h1{font-size:30px;}}
</style>
</head>
<body>
<div class="page">

<div class="cover">
  <span class="badge">LALUNE · 통합 ERP USER MANUAL</span>
  <h1>라린느 <b>통합 ERP</b><br/>사용 매뉴얼</h1>
  <p>Cafe24 · 스마트스토어 · 자사몰 3개 채널 주문을 하나로 — 의류 제조·유통 통합 업무 시스템</p>
  <div class="meta">
    <div><strong>대상</strong>라린느 운영팀 (업체용)</div>
    <div><strong>버전</strong>MVP v1.0</div>
    <div><strong>데이터 기준</strong>검토용_라린느_ERP_v45</div>
    <div><strong>접속</strong>maximpact.co.kr/lalune-erp</div>
  </div>
</div>

<div class="login">
  <h3>🔑 접속 정보</h3>
  <div class="row">
    <div><b>주소(URL)</b><code>https://maximpact.co.kr/lalune-erp</code></div>
    <div><b>아이디</b><code>admin</code></div>
    <div><b>비밀번호</b><code>admin1234</code></div>
    <div><b>권한</b>관리자(전체 메뉴)</div>
  </div>
</div>

<div class="body">

  <div class="toc">
    <h2>목차</h2>
    <div class="toc-grid">
      <a href="#s1"><span class="n">1</span> 시작하기 · 로그인</a>
      <a href="#s2"><span class="n">2</span> 시스템 한눈에 보기</a>
      <a href="#s3"><span class="n">3</span> 대시보드</a>
      <a href="#s4"><span class="n">4</span> 채널 주문 수집(핵심)</a>
      <a href="#s5"><span class="n">5</span> 통합 주문</a>
      <a href="#s6"><span class="n">6</span> 출고 관리</a>
      <a href="#s7"><span class="n">7</span> 생산 관리</a>
      <a href="#s8"><span class="n">8</span> 발주·구매</a>
      <a href="#s9"><span class="n">9</span> 재고 관리</a>
      <a href="#s10"><span class="n">10</span> 반품 관리</a>
      <a href="#s11"><span class="n">11</span> 상품 / SKU</a>
      <a href="#s12"><span class="n">12</span> 고객 관리</a>
      <a href="#s13"><span class="n">13</span> 정산·분석</a>
      <a href="#s14"><span class="n">14</span> 업무 시나리오</a>
      <a href="#s15"><span class="n">15</span> 번호체계 · FAQ</a>
    </div>
  </div>

  <section id="s1">
    <div class="lbl">Getting Started</div>
    <h2 class="title">1. 시작하기 · 로그인</h2>
    <p class="desc">브라우저(크롬 권장)에서 <b>maximpact.co.kr/lalune-erp</b> 에 접속하고, 발급받은 아이디·비밀번호로 로그인합니다. 로그인 후 12시간 동안 세션이 유지되며, 우측 상단 <b>로그아웃</b>으로 종료합니다.</p>
    ${shot("01-login.jpeg", "로그인 화면 — 아이디/비밀번호 입력 후 [로그인]")}
    <table class="kv">
      <tr><th>주소</th><td>https://maximpact.co.kr/lalune-erp</td></tr>
      <tr><th>아이디 / 비밀번호</th><td>admin / admin1234</td></tr>
      <tr><th>화면 구성</th><td>좌측 <b>메뉴(사이드바)</b> · 상단 <b>현재 화면명·사용자</b> · 가운데 <b>본문</b></td></tr>
    </table>
  </section>

  <section id="s2">
    <div class="lbl">Overview</div>
    <h2 class="title">2. 시스템 한눈에 보기 — 데이터는 이렇게 흐릅니다</h2>
    <p class="desc">라린느는 <b>Cafe24·스마트스토어·자사몰</b> 3개 쇼핑몰과 오프라인(전화·방문·B2B)에서 주문이 들어옵니다. ERP는 이 주문을 한 곳에 모아(수집) → 하나의 <b>통합 주문</b>으로 정리 → 출고·생산·재고·반품·고객·정산으로 자동 연결합니다.</p>
    <div class="flow">
      <div class="step"><div class="num">1</div><div class="box"><b>주문 발생</b> &nbsp;<span>Cafe24 · 스마트스토어 · 자사몰 · 오프라인(전화/방문/B2B)</span></div></div>
      <div class="arrow">▼ ① 수집 (엑셀 업로드 또는 동기화 버튼)</div>
      <div class="step"><div class="num">2</div><div class="box"><b>원천 주문에 쌓임</b> &nbsp;<span>「채널 주문 수집」 화면의 ‘수집된 원천 주문’ 목록 + 신규 고객 자동 등록</span></div></div>
      <div class="arrow">▼ ② 정규화 (자동)</div>
      <div class="step"><div class="num">3</div><div class="box"><b>통합 주문으로 정리</b> &nbsp;<span>채널·상태·금액·고객이 정리된 주문 원장 — 모든 처리의 출발점</span></div></div>
      <div class="arrow">▼ ③ 자동 분기 / 처리</div>
      <div class="step"><div class="num">4</div><div class="box"><b>운영·분석으로 연결</b>
        <div class="chips"><span class="chip">출고 관리</span><span class="chip">생산 관리</span><span class="chip">재고 자동 반영</span><span class="chip">반품 관리</span><span class="chip">고객 등급</span><span class="chip">정산·분석</span></div>
      </div></div>
    </div>
    <div class="callout next"><span class="ic">➡</span><div><b>핵심 한 줄.</b> 「채널 주문 수집」에서 <b>업로드/동기화</b>하면 → <b>원천 주문</b>에 쌓이고 → <b>통합 주문</b>으로 정리됩니다. 그다음 스텝은 <b>출고 관리</b>에서 출고 처리(→ 재고 자동 차감), 필요 시 <b>생산·발주</b> 진행입니다.</div></div>
  </section>

  <section id="s3">
    <div class="lbl">Dashboard</div>
    <h2 class="title">3. 대시보드</h2>
    <p class="desc">로그인하면 가장 먼저 보이는 화면입니다. 매출·주문·재고·고객 현황을 한눈에 확인합니다.</p>
    ${shot("02-dashboard.jpeg", "대시보드 — 핵심 KPI · 채널별 매출 · 주문 상태 · 최근 주문 · 발주 필요 품목")}
    <h3 class="sub">주요 항목</h3>
    <ul>
      <li><b>상단 KPI</b> — 총 매출(누적)·총 주문·총 SKU·총 고객 / 총 판매수량·출고완료·재고부족·품절</li>
      <li><b>채널별 매출</b> — 기타·온라인·B2B·개인·대리점 등 채널별 매출 막대</li>
      <li><b>주문 상태</b> — 접수·생산중·자수대기·출고완료·반품/취소 건수</li>
      <li><b>최근 주문</b> / <b>발주 필요 품목</b> — 클릭 시 해당 상세 화면으로 이동</li>
    </ul>
    <div class="callout next"><span class="ic">➡</span><div><b>다음 스텝.</b> 신규 주문을 넣으려면 좌측 <b>채널 주문 수집</b>, 주문을 처리하려면 <b>통합 주문 / 출고 관리</b>로 이동하세요.</div></div>
  </section>

  <section id="s4">
    <div class="lbl">Core — Order Collection</div>
    <h2 class="title">4. 채널 주문 수집 <span style="font-size:15px;color:var(--brand)">★ 가장 중요</span></h2>
    <p class="desc">쇼핑몰에서 받은 주문을 시스템에 올리는 화면입니다. 두 가지 방법이 있습니다 — <b>① 엑셀 업로드</b>(실제 사용), <b>② 채널 동기화 버튼</b>(데모/시연용).</p>
    ${shot("04-upload.jpeg", "채널 주문 수집 — 동기화 버튼 · 엑셀 양식 다운로드 · 수집·동기화 이력 · 수집된 원천 주문")}
    <h3 class="sub">① 엑셀 업로드 (실제 운영 방식)</h3>
    <ol>
      <li><b>[⬇ Cafe24 엑셀 양식 다운로드]</b> 클릭 — 카페24 「카페_26」 시트와 동일한 28열 양식이 받아집니다(처음 한 번만 받아두면 됨).</li>
      <li>쇼핑몰 관리자에서 받은 주문 엑셀(또는 위 양식에 채운 파일)을 준비합니다.</li>
      <li><b>유형 선택</b> — 온라인 주문 / 오프라인 주문서</li>
      <li><b>[파일 선택]</b> → 엑셀 선택 → <b>[업로드 & 수집]</b></li>
      <li>완료 메시지(○건 수집 · 신규 고객 ○명 자동등록)와 함께 아래 목록에 즉시 반영됩니다.</li>
    </ol>
    <div class="callout tip"><span class="ic">✓</span><div>비워도 되는 칸은 비워도 됩니다. <b>채널·주문상태·고객코드는 시스템이 자동 분류</b>하고, 처음 보는 결제자는 <b>고객 마스터에 자동 등록</b>됩니다.</div></div>
    <h3 class="sub">② 채널 동기화 (데모 — 시연용)</h3>
    <p class="desc"><b>Cafe24 · 스마트스토어 · 자사몰</b> 버튼을 누르면 샘플 주문 5건이 즉시 들어오며 데이터가 전 화면으로 흐르는 과정을 보여줍니다.</p>
    ${shot("13-sync-result.jpeg", "Cafe24 동기화 결과 — 5건 수집 + 고객 누적/등급 자동 갱신 + 원천 주문 반영")}
    <div class="callout warn"><span class="ic">!</span><div>동기화 버튼은 <b>데모 사이트용</b>입니다. 실제 쇼핑몰 API 통신은 하지 않으며, 데이터 흐름 시연을 위한 버튼입니다. 실운영은 <b>엑셀 업로드</b>로 진행합니다. (추후 API 자동수집은 2차 과제)</div></div>
    <div class="callout next"><span class="ic">➡</span><div><b>업로드/동기화하면 → 여기 ‘수집된 원천 주문’에 쌓이고 → 자동으로 ‘통합 주문’으로 정리됩니다.</b> 다음 스텝은 <b>5. 통합 주문</b>에서 상태를 확인·처리하는 것입니다.</div></div>
  </section>

  <section id="s5">
    <div class="lbl">Orders</div>
    <h2 class="title">5. 통합 주문 — 모든 주문의 중심</h2>
    <p class="desc">3개 채널 + 오프라인 주문이 하나로 정리되는 화면입니다. 검색·채널/상태 필터로 원하는 주문을 찾고, 행마다 <b>상태 변경</b>과 <b>취소/환불</b>을 바로 처리합니다.</p>
    ${shot("03-orders.jpeg", "통합 주문 — 채널·상태 필터 + 행별 ‘처리’(상태 드롭다운 · 취소/환불)")}
    <h3 class="sub">할 수 있는 작업</h3>
    <ul>
      <li><b>검색</b> — 주문번호·고객·상품·SKU로 검색</li>
      <li><b>필터</b> — 채널(온라인/B2B/자사몰…)·상태(접수/생산중/자수대기/출고완료/반품) 칩 클릭. 함께 적용됩니다.</li>
      <li><b>상태 변경</b> — ‘처리’ 칸의 드롭다운에서 접수→생산중→자수대기→<b>출고완료</b>로 변경. 출고완료 시 <b>재고가 자동 차감</b>됩니다.</li>
      <li><b>취소/환불</b> — [취소/환불] 클릭 → 확인 → 상태가 ‘반품/취소’로 바뀌고 <b>반품 기록이 자동 생성</b>되며, 출고됐던 건이면 <b>재고가 복원</b>됩니다.</li>
    </ul>
    <div class="callout next"><span class="ic">➡</span><div><b>다음 스텝.</b> 아직 출고 안 된 주문은 <b>6. 출고 관리</b>에서 모아 보고, 제작이 필요하면 <b>7. 생산 관리</b>에서 생산을 지시합니다.</div></div>
  </section>

  <section id="s6">
    <div class="lbl">Shipping</div>
    <h2 class="title">6. 출고 관리</h2>
    <p class="desc">아직 출고되지 않은 주문(접수·생산중·자수대기)을 모아 봅니다. 단계별 건수가 상단에 요약됩니다.</p>
    ${shot("05-shipping.jpeg", "출고 관리 — 접수/생산중/자수대기/출고완료 요약 + 출고 대기 목록")}
    <div class="callout next"><span class="ic">➡</span><div>실제 출고가 끝나면 <b>5. 통합 주문</b>에서 해당 주문을 <b>출고완료</b>로 바꿔주세요 → 재고가 자동 차감됩니다.</div></div>
  </section>

  <section id="s7">
    <div class="lbl">Production</div>
    <h2 class="title">7. 생산 관리</h2>
    <p class="desc">제작이 필요한 주문의 생산 진행을 관리합니다. 본공장/외주, 주문·생산·불량·입고 수량, 대표님 확인, 지연 여부를 표시합니다.</p>
    ${shot("06-production.jpeg", "생산 관리 — 생산번호별 진행 현황(공장·수량·대표확인·지연)")}
    <div class="callout warn"><span class="ic">!</span><div>현재 <b>생산번호</b>는 원본 엑셀의 값을 그대로 가져온 상태(P01 · PRD-자동-001 · PRD-61월- … 혼재)입니다. 정식 운영 시 <b>PRD-YYYY-NNN</b> 표준 번호체계로 정리할 수 있습니다(15장 참고).</div></div>
  </section>

  <section id="s8">
    <div class="lbl">Purchase</div>
    <h2 class="title">8. 발주·구매</h2>
    <p class="desc">공급사 발주서를 관리하고, <b>재고가 안전재고보다 적은 품목</b>을 자동으로 모아 보여줍니다(발주 필요 품목 자동 감지).</p>
    ${shot("07-purchase.jpeg", "발주·구매 — 발주서(PO) + 발주 필요 품목 자동 감지")}
    <div class="callout next"><span class="ic">➡</span><div><b>다음 스텝.</b> ‘발주 필요 품목’을 보고 공급사에 발주 → 입고되면 <b>9. 재고 관리</b>에서 현재고를 보정합니다.</div></div>
  </section>

  <section id="s9">
    <div class="lbl">Inventory</div>
    <h2 class="title">9. 재고 관리</h2>
    <p class="desc">SKU별 현재고·안전재고·상태(정상/부족/품절)를 봅니다. 현재고는 <b>초기재고 + 입고 − 출고 + 반품</b>으로 자동 계산되며, 실사 후 <b>[수정]</b>으로 직접 보정할 수 있습니다.</p>
    ${shot("08-inventory.jpeg", "재고 관리 — SKU별 현재고/안전재고/상태 + [수정](현재고·안전재고 보정)")}
    <h3 class="sub">재고 수정 방법</h3>
    <ol>
      <li>행 오른쪽 <b>[수정]</b> 클릭 → 현재고·안전재고 입력칸이 나타납니다.</li>
      <li>실제 수량을 입력하고 <b>[저장]</b> → 상태(정상/부족/품절)와 부족수량이 자동 재계산됩니다.</li>
    </ol>
    <div class="callout warn"><span class="ic">!</span><div>초기 현재고가 대부분 <b>0(품절)</b>로 보이는 것은, 원본 엑셀에 실제 재고 수량이 입력돼 있지 않기 때문입니다. 실사 후 [수정]으로 채우면 정상 표시됩니다.</div></div>
  </section>

  <section id="s10">
    <div class="lbl">Returns</div>
    <h2 class="title">10. 반품 관리</h2>
    <p class="desc">반품 내역(반품번호·주문·SKU·수량·사유)을 봅니다. 통합 주문에서 <b>취소/환불</b> 처리하면 이곳에 <b>자동으로 기록</b>됩니다.</p>
    ${shot("09-returns.jpeg", "반품 관리 — 반품 내역(RTN) · 카페24/주문서 자동 집계")}
  </section>

  <section id="s11">
    <div class="lbl">Products</div>
    <h2 class="title">11. 상품 / SKU</h2>
    <p class="desc">상품 마스터입니다. SKU·상품명·카테고리·컬러·사이즈와 원가·채널별 가격(온라인/B2B/대리점)·안전재고를 관리합니다.</p>
    ${shot("10-products.jpeg", "상품 / SKU — 상품 마스터(가격·안전재고)")}
  </section>

  <section id="s12">
    <div class="lbl">Customers</div>
    <h2 class="title">12. 고객 관리</h2>
    <p class="desc">고객 마스터 + <b>고객 등급 자동 산정</b>(VIP=누적 500만↑ / 우수=100만↑ / 일반 / 신규)입니다. 누적매출·주문수가 자동 계산되고, 업로드/동기화 시 신규 결제자가 <b>자동 등록</b>됩니다.</p>
    ${shot("11-customers.jpeg", "고객 관리 — 누적매출·주문수·등급 자동 산정")}
    ${shot("14-customer-flow.jpeg", "데이터 흐름 증거 — 동기화로 들어온 ‘노성준’이 자동 등록되고 누적·등급이 갱신됨")}
  </section>

  <section id="s13">
    <div class="lbl">Analytics</div>
    <h2 class="title">13. 정산·분석</h2>
    <p class="desc">채널별 매출·비중, 월별 매출 추이, 고객 등급 분포, SKU별 매출 TOP10을 자동 집계합니다.</p>
    ${shot("12-analytics.jpeg", "정산·분석 — 채널별 매출 · 월별 추이 · 고객 등급 · SKU TOP10")}
    <div class="callout warn"><span class="ic">!</span><div>손익(원가·이익)은 <b>주문↔상품 SKU 매칭</b> 후 산출됩니다. 현재 원본 데이터는 채널마다 SKU 체계가 달라 매칭률이 낮아 <b>매출 중심</b>으로 표기되며, <b>SKU 표준화(2차)</b> 완료 시 채널별 원가·마진이 자동 표기됩니다.</div></div>
  </section>

  <section id="s14">
    <div class="lbl">Scenarios</div>
    <h2 class="title">14. 업무 시나리오 (실제 흐름)</h2>

    <div class="scen">
      <span class="tag">시나리오 1 · 온라인 주문 처리</span>
      <h4>Cafe24에서 주문이 들어왔어요</h4>
      <ol>
        <li>쇼핑몰에서 주문 엑셀 다운로드 → <b>채널 주문 수집</b>에서 [업로드 & 수집] (또는 데모: Cafe24 동기화)</li>
        <li><b>통합 주문</b>에 ‘접수’ 상태로 정리됨 (신규 고객은 자동 등록)</li>
        <li>제작 필요 시 상태를 <b>생산중 → 자수대기</b>로 변경 (생산 진행은 7. 생산 관리)</li>
        <li>출고하면 상태를 <b>출고완료</b>로 변경 → <b>재고 자동 차감</b></li>
        <li><b>정산·분석 / 대시보드</b>에 매출·판매수량 자동 반영</li>
      </ol>
    </div>

    <div class="scen">
      <span class="tag">시나리오 2 · B2B 단체주문</span>
      <h4>병원/기업에서 단체 주문을 받았어요</h4>
      <ol>
        <li><b>채널 주문 수집</b>에서 유형을 <b>오프라인 주문서</b>로 선택해 업로드(또는 양식에 직접 입력)</li>
        <li><b>통합 주문</b>에서 B2B 주문 확인 → 수량만큼 <b>생산 관리</b>에서 제작 진행</li>
        <li>생산 완료 → 출고완료 처리 → 거래처(고객)는 <b>고객 관리</b>에서 누적·등급 자동 반영</li>
      </ol>
    </div>

    <div class="scen">
      <span class="tag">시나리오 3 · 취소/환불</span>
      <h4>고객이 주문을 취소했어요</h4>
      <ol>
        <li><b>통합 주문</b>에서 해당 주문의 <b>[취소/환불]</b> 클릭 → 확인</li>
        <li>상태가 <b>반품/취소</b>로 변경, <b>반품 관리</b>에 자동 기록(RTN)</li>
        <li>이미 출고된 건이면 <b>재고가 복원</b>되고, 분석의 순매출에서 차감됩니다</li>
      </ol>
    </div>

    <div class="scen">
      <span class="tag">시나리오 4 · 재고 부족 → 발주</span>
      <h4>재고가 부족해요</h4>
      <ol>
        <li><b>대시보드 / 재고 관리</b>에서 부족·품절 SKU 확인</li>
        <li><b>발주·구매</b>의 ‘발주 필요 품목(자동 감지)’에서 대상 확인 → 공급사 발주</li>
        <li>입고되면 <b>재고 관리 → [수정]</b>으로 현재고를 실제 수량으로 보정</li>
      </ol>
    </div>
  </section>

  <section id="s15">
    <div class="lbl">Reference</div>
    <h2 class="title">15. 번호체계 · 자주 묻는 질문</h2>
    <h3 class="sub">번호체계 표준</h3>
    <table class="kv">
      <tr><th>주문번호</th><td>ORD-YYYY-NNN (또는 쇼핑몰 주문번호 그대로)</td></tr>
      <tr><th>생산번호</th><td>PRD-YYYY-NNN <span style="color:var(--muted)">(현재 원본 데이터는 일부 비표준 — 표준화 가능)</span></td></tr>
      <tr><th>반품번호</th><td>RTN-YYYY-NNN</td></tr>
      <tr><th>발주번호</th><td>PO-YYYY-NNN</td></tr>
      <tr><th>고객코드</th><td>A + 일련번호 (예: A001)</td></tr>
      <tr><th>SKU</th><td>브랜드+카테고리+팔길이-색상-사이즈 (예: LJKT-GREBK-XS)</td></tr>
    </table>
    <h3 class="sub">자주 묻는 질문</h3>
    <ul>
      <li><b>Q. 엑셀을 올렸는데 칸이 비어 보여요.</b> → 쇼핑몰 양식과 컬럼 순서가 다를 수 있습니다. <b>[Cafe24 엑셀 양식 다운로드]</b> 형식에 맞춰 주세요. (양식 = 카페24 「카페_26」 시트 28열과 동일)</li>
      <li><b>Q. 같은 파일을 두 번 올리면?</b> → 그만큼 중복으로 쌓입니다. 한 번만 올려 주세요.</li>
      <li><b>Q. 재고가 전부 0(품절)이에요.</b> → 원본 엑셀에 실제 재고가 없어서입니다. <b>재고 관리 → [수정]</b>으로 실사 수량을 입력하세요.</li>
      <li><b>Q. Cafe24와 실시간 자동 연동되나요?</b> → 현재는 <b>엑셀 업로드</b> 방식입니다. API 자동수집은 2차 과제(쇼핑몰 인증키 필요)입니다.</li>
      <li><b>Q. 손익(이익)이 0으로 보여요.</b> → 주문↔상품 SKU 매칭 후 산출됩니다. SKU 표준화(2차) 후 정확히 표기됩니다.</li>
      <li><b>Q. 화면이 안 떠요.</b> → 새로고침 → 그래도 안 되면 <b>어느 메뉴에서 무엇을 눌렀을 때</b>인지 담당자(MaxImpact)에게 알려주세요.</li>
    </ul>
  </section>

</div>

<div class="foot">
  라린느 통합 ERP 사용 매뉴얼 · MVP v1.0 · 데이터 기준: 검토용_라린느_ERP_v45<br/>
  © 2026 MaxImpact. 이 매뉴얼은 현재 MVP 기준이며 기능 추가 시 함께 업데이트됩니다.
</div>

</div>
</body>
</html>`;

export function GET() {
  return new NextResponse(HTML, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
