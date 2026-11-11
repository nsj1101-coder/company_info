"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Intro.module.css";

const SEEN_KEY = "mx-intro-seen";
const ITEM_SEL = "nav, .hero-inner > *, .hero-wave, .metric, .reveal, .stagger > *, footer > *";
const ATOM_TAGS = new Set(["svg", "img", "input", "select", "textarea", "button"]);
const SKIP_TAGS = new Set(["script", "style", "br", "option", "defs"]);
const EASE_POP = "cubic-bezier(0.34, 1.56, 0.64, 1)";

// 요소 하나가 거치는 단계(ms): 영역 선택 → 실제 내용
// PACE를 키우면 전체가 느려진다(1 = 가장 빠름).
const PACE = 2;
const DRAW_ATOM_MS = 70 * PACE;
const DRAW_BOX_MS = 120 * PACE;
const STAGE_MS = 700;
const REVEAL_AT_MS = 60;

const CURSORS = [
  { name: "디자인", color: "#ff5722" },
  { name: "개발", color: "#0d99ff" },
  { name: "기획", color: "#14ae5c" },
  { name: "QA", color: "#9747ff" },
];

type Task = { el: HTMLElement; kind: "atom" | "box"; text: boolean; fixed: boolean; instant: boolean };

// 재생 대상이면 첫 페인트 전에 요소를 숨긴다. 스크립트가 끝내 실행되지 않으면 5초 뒤 원복한다.
const BOOT_SCRIPT = `(function(){try{var d=document.documentElement,f=/[?&]intro\\b/.test(location.search);if(f||!(sessionStorage.getItem('${SEEN_KEY}')||matchMedia('(prefers-reduced-motion: reduce)').matches)){d.classList.add('intro-on');setTimeout(function(){if(!window.__mxIntro){d.classList.remove('intro-on')}},5000)}}catch(e){}})()`;

const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function hasOwnText(el: Element): boolean {
  for (const n of Array.from(el.childNodes)) {
    if (n.nodeType === Node.TEXT_NODE && n.textContent && n.textContent.trim()) return true;
  }
  return false;
}

function hasBoxVisual(el: Element): boolean {
  const cs = getComputedStyle(el);
  const bg = cs.backgroundColor;
  return (
    (bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") ||
    cs.backgroundImage !== "none" ||
    parseFloat(cs.borderTopWidth) > 0 ||
    cs.boxShadow !== "none"
  );
}

// 글자·아이콘·입력칸 같은 말단 요소(atom)와 배경을 가진 상자(box)를 문서 순서대로 모은다.
function buildTasks(): Task[] {
  const tasks: Task[] = [];
  const seen = new Set<Element>();
  const visit = (el: Element) => {
    if (seen.has(el)) return;
    seen.add(el);
    const tag = el.tagName.toLowerCase();
    if (SKIP_TAGS.has(tag) || el.getClientRects().length === 0) return;
    const fixed = Boolean(el.closest("nav"));
    const html = el as HTMLElement;
    if (ATOM_TAGS.has(tag) || hasOwnText(el)) {
      el.querySelectorAll("*").forEach((d) => seen.add(d));
      tasks.push({ el: html, kind: "atom", text: !ATOM_TAGS.has(tag), fixed, instant: false });
      return;
    }
    if (el.matches(ITEM_SEL)) {
      tasks.push({ el: html, kind: "box", text: false, fixed, instant: !hasBoxVisual(el) });
    }
    Array.from(el.children).forEach(visit);
  };
  document.querySelectorAll(ITEM_SEL).forEach(visit);
  return tasks;
}

export default function Intro() {
  const layerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const layer = layerRef.current;
    if (!layer || !html.classList.contains("intro-on")) {
      setDone(true);
      return;
    }
    (window as unknown as { __mxIntro?: boolean }).__mxIntro = true;
    const ovDoc = layer.querySelector<HTMLElement>("[data-ov='doc']");
    const ovFix = layer.querySelector<HTMLElement>("[data-ov='fix']");
    if (!ovDoc || !ovFix) return;

    let cancelled = false;
    let ended = false;
    let follow = true;
    let loopRaf = 0;
    const timers: number[] = [];

    const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
    const later = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(() => { if (!cancelled) fn(); }, ms));
    };
    const tween = async (ms: number, fn: (p: number) => void) => {
      const t0 = performance.now();
      for (;;) {
        if (cancelled) return;
        const p = Math.min(1, (performance.now() - t0) / ms);
        fn(p);
        if (p >= 1) return;
        await frame();
      }
    };
    const scrollToY = (y: number) => window.scrollTo({ top: y, behavior: "instant" });

    const cursorEls = Array.from(layer.querySelectorAll<HTMLElement>("[data-cursor]"));
    const vw0 = window.innerWidth;
    const vh0 = window.innerHeight;
    const cursorPos = [
      { x: vw0 * 0.35, y: vh0 - 60 },
      { x: vw0 - 90, y: vh0 * 0.4 },
      { x: 12, y: vh0 * 0.6 },
      { x: vw0 * 0.7, y: vh0 - 60 },
    ];
    const setCursor = (i: number, x: number, y: number) => {
      cursorPos[i] = { x, y };
      cursorEls[i].style.transform = `translate(${x}px, ${y}px)`;
    };
    cursorPos.forEach((p, i) => setCursor(i, p.x, p.y));

    const reveal = (t: Task) => {
      if (t.el.classList.contains("intro-in")) return;
      t.el.classList.add("intro-in");
      if (t.instant) return;
      if (t.text) {
        t.el.animate(
          [
            { opacity: 0, clipPath: "inset(-10% 100% -10% -5%)", offset: 0 },
            { clipPath: "inset(-10% -5% -10% -5%)", offset: 1 },
          ],
          { duration: 450, easing: "cubic-bezier(0.3, 0, 0.1, 1)" },
        );
      } else {
        t.el.animate([{ opacity: 0, transform: "scale(0.9)", offset: 0 }], { duration: 380, easing: EASE_POP });
      }
    };

    const finish = () => {
      if (ended) return;
      ended = true;
      cancelled = true;
      cancelAnimationFrame(loopRaf);
      timers.forEach((id) => window.clearTimeout(id));
      html.classList.add("intro-done");
      html.classList.remove("intro-on");
      document.querySelectorAll(".reveal, .stagger").forEach((el) => el.classList.add("in"));
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // 저장소를 쓸 수 없으면 다음 방문에 다시 재생될 뿐이다.
      }
      setDone(true);
    };

    const run = async () => {
      scrollToY(0);
      // 커서가 문서 밖으로 나가 스크롤 영역을 늘리지 않도록 레이어를 문서 크기로 고정한다.
      layer.style.height = `${html.scrollHeight}px`;
      layer.style.setProperty("--stage", `${STAGE_MS}ms`);
      const tasks = buildTasks();
      tasks.forEach((t) => { if (t.kind === "atom") t.el.classList.add("intro-atom"); });

      let next = 0;
      let finished = 0;
      let curScroll = 0;
      let scrollTarget = 0;

      // 작업 중인 요소를 화면 중앙 부근에 두도록 스크롤이 따라간다.
      const loop = () => {
        if (cancelled || !follow) return;
        const d = scrollTarget - curScroll;
        if (Math.abs(d) > 0.5) {
          curScroll += d * 0.16;
          scrollToY(curScroll);
        }
        loopRaf = requestAnimationFrame(loop);
      };
      loopRaf = requestAnimationFrame(loop);

      const worker = async (ci: number) => {
        while (!cancelled) {
          const t = tasks[next++];
          if (!t) return;
          const vh = window.innerHeight;
          const vw = window.innerWidth;
          let rc = t.el.getBoundingClientRect();
          if (t.instant || rc.width < 2 || rc.height < 2) {
            reveal({ ...t, instant: true });
            finished++;
            continue;
          }
          if (!t.fixed) {
            const maxScroll = Math.max(0, html.scrollHeight - vh);
            // 작업 지점을 화면 아래쪽에 두어, 방금 완성된 내용이 위에 오래 남아 읽히게 한다.
            scrollTarget = Math.max(scrollTarget, clamp(rc.top + window.scrollY - vh * 0.6, 0, maxScroll));
            const waitFrom = performance.now();
            while (
              !cancelled &&
              t.el.getBoundingClientRect().top > vh * 0.88 &&
              window.scrollY < maxScroll - 1 &&
              performance.now() - waitFrom < 2000
            ) {
              await frame();
            }
            if (cancelled) return;
            rc = t.el.getBoundingClientRect();
          }
          const sy = window.scrollY;
          const x = rc.left;
          const y = rc.top + sy;

          // 화면 밖에 남겨진 커서는 가장자리에서 다시 들어오게 한다.
          let from = cursorPos[ci];
          if (from.y < sy - 40 || from.y > sy + vh + 40) {
            const edges = [
              { x: vw * 0.35, y: sy + vh - 20 },
              { x: vw - 70, y: sy + vh * 0.4 },
              { x: 12, y: sy + vh * 0.6 },
              { x: vw * 0.7, y: sy + vh - 20 },
            ];
            from = edges[ci];
          }
          const start = from;
          const dist = Math.hypot(x - start.x, y - start.y);
          await tween(clamp(40 + dist * 0.06, 50, 130) * PACE, (p) => {
            const e = easeInOut(p);
            setCursor(ci, lerp(start.x, x, e), lerp(start.y, y, e));
          });
          if (cancelled) return;

          // 1) 영역 선택
          const host = t.fixed ? ovFix : ovDoc;
          const top = t.fixed ? rc.top : y;
          const sel = document.createElement("div");
          sel.className = `${styles.sel} ${t.kind === "box" ? styles.selBox : ""}`;
          sel.style.left = `${x}px`;
          sel.style.top = `${top}px`;
          sel.innerHTML =
            t.kind === "box"
              ? `<i></i><i></i><i></i><i></i><span>${t.el.classList[0] ?? t.el.tagName.toLowerCase()} · ${Math.round(rc.width)} × ${Math.round(rc.height)}</span>`
              : "<i></i><i></i><i></i><i></i>";
          host.appendChild(sel);
          await tween(t.kind === "box" ? DRAW_BOX_MS : DRAW_ATOM_MS, (p) => {
            sel.style.width = `${rc.width * p}px`;
            sel.style.height = `${rc.height * p}px`;
            setCursor(ci, x + rc.width * p, y + rc.height * p);
          });
          if (cancelled) return;

          // 2) 선택이 끝나면 바로 실제 내용이 나타나고, 선택 표시는 잠시 뒤 사라진다.
          later(REVEAL_AT_MS, () => reveal(t));
          later(STAGE_MS, () => sel.remove());

          finished++;
          if (barRef.current) barRef.current.style.width = `${(finished / tasks.length) * 100}%`;
        }
      };

      await Promise.all(CURSORS.map((_, i) => worker(i)));
      if (cancelled) return;
      await tween(STAGE_MS, () => undefined);
      if (cancelled) return;
      follow = false;
      cursorEls.forEach((el) => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" }));
      const sEnd = window.scrollY;
      await tween(800, (p) => scrollToY(lerp(sEnd, 0, easeInOut(p))));
      finish();
    };

    const events = ["pointerdown", "keydown", "wheel", "touchstart"] as const;
    events.forEach((ev) => window.addEventListener(ev, finish, { passive: true }));
    void run();

    return () => {
      cancelled = true;
      cancelAnimationFrame(loopRaf);
      timers.forEach((id) => window.clearTimeout(id));
      events.forEach((ev) => window.removeEventListener(ev, finish));
      ovDoc.replaceChildren();
      ovFix.replaceChildren();
    };
  }, []);

  if (done) return null;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      <div ref={layerRef} className={styles.layer} aria-hidden="true">
        <div className={styles.ovDoc} data-ov="doc" />
        <div className={styles.ovFix} data-ov="fix" />
        {CURSORS.map((c, i) => (
          <div className={styles.cursor} data-cursor={i} key={c.name} style={{ color: c.color }}>
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M3 2l13 6.2-5.6 1.9L8.4 16 3 2z" fill="currentColor" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
            <span>{c.name}</span>
          </div>
        ))}
        <div className={styles.toast}>
          <i />
          사이트 조립 중 · 클릭하면 바로 보기
          <span className={styles.track}>
            <span ref={barRef} />
          </span>
        </div>
      </div>
    </>
  );
}
