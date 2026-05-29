"use client";

import { useEffect, useRef, useState } from "react";

export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      navRef.current?.classList.toggle("scrolled", window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav id="nav" ref={navRef}>
      <a href="#" className="brand" aria-label="MaxImpact 홈">
        <span className="brand-dot" />
        MaxImpact
      </a>
      <ul className={`nav-links${open ? " open" : ""}`}>
        <li><a href="#about" onClick={() => setOpen(false)}>About</a></li>
        <li><a href="#services" onClick={() => setOpen(false)}>Services</a></li>
        <li><a href="#portfolio" onClick={() => setOpen(false)}>Portfolio</a></li>
        <li><a href="#team" onClick={() => setOpen(false)}>Team</a></li>
        <li>
          <a href="#contact" className="nav-cta" onClick={() => setOpen(false)}>
            프로젝트 문의
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </li>
      </ul>
      <button className="mobile-btn" aria-label="메뉴 열기" onClick={() => setOpen((v) => !v)}>
        <span /><span /><span />
      </button>
    </nav>
  );
}
