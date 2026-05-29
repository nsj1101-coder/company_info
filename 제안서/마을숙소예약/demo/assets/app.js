/* 달내마을 데모 공통 스크립트 */
(function () {
  // ── 모바일 메뉴 토글 ──
  const burger = document.querySelector('.hamburger');
  const gnb = document.querySelector('.gnb');
  if (burger && gnb) {
    burger.addEventListener('click', () => {
      const open = gnb.style.display === 'flex';
      gnb.style.display = open ? '' : 'flex';
      gnb.style.position = 'absolute';
      gnb.style.flexDirection = 'column';
      gnb.style.top = '78px'; gnb.style.left = '0'; gnb.style.right = '0';
      gnb.style.background = 'var(--paper)'; gnb.style.padding = '12px 24px';
      gnb.style.borderBottom = '1px solid var(--line)';
    });
  }

  // ── 히어로 슬라이더 ──
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dots button');
  if (slides.length) {
    let i = 0;
    const go = (n) => {
      slides.forEach((s, k) => s.classList.toggle('active', k === n));
      dots.forEach((d, k) => d.classList.toggle('active', k === n));
      i = n;
    };
    dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
    setInterval(() => go((i + 1) % slides.length), 5500);
  }

  // ── 스크롤 등장 ──
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ── 지도 마커 ↔ 리스트 연동 ──
  const markers = document.querySelectorAll('.marker');
  const pois = document.querySelectorAll('.poi');
  const sync = (id) => {
    markers.forEach(m => m.classList.toggle('active', m.dataset.id === id));
    pois.forEach(p => p.classList.toggle('active', p.dataset.id === id));
  };
  markers.forEach(m => m.addEventListener('mouseenter', () => sync(m.dataset.id)));
  pois.forEach(p => {
    p.addEventListener('mouseenter', () => sync(p.dataset.id));
    p.addEventListener('click', () => sync(p.dataset.id));
  });

  // ── 지도 카테고리 필터 ──
  const chips = document.querySelectorAll('.map-filters .chip');
  chips.forEach(c => c.addEventListener('click', () => {
    chips.forEach(x => x.classList.remove('active'));
    c.classList.add('active');
    const cat = c.dataset.cat;
    document.querySelectorAll('.marker').forEach(m => {
      m.style.display = (cat === 'all' || m.classList.contains(cat)) ? '' : 'none';
    });
    document.querySelectorAll('.poi').forEach(p => {
      p.style.display = (cat === 'all' || p.dataset.cat === cat) ? '' : 'none';
    });
  }));

  // ── 좋아요 토글 ──
  document.querySelectorAll('.like-btn').forEach(b => b.addEventListener('click', (e) => {
    e.preventDefault();
    b.textContent = b.textContent.trim() === '♥' ? '♡' : '♥';
    b.style.color = b.textContent.trim() === '♥' ? '#c0392b' : '';
  }));
})();
