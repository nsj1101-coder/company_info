"use client";

import { useRef, useState } from "react";
import { projectTypes } from "@/lib/data";

export default function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: fd.get("name"),
      phone: fd.get("phone"),
      email: fd.get("email"),
      project_type: fd.get("project_type"),
      description: fd.get("description"),
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "전송에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setToast(true);
      form.reset();
      setTimeout(() => setToast(false), 2800);
    } catch (err) {
      alert(err instanceof Error ? err.message : "전송 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="contact-grid">
          <div className="contact-info reveal">
            <span
              className="eyebrow"
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 12, fontWeight: 700, letterSpacing: "2.5px",
                textTransform: "uppercase", color: "var(--accent)",
                marginBottom: 20, display: "inline-block",
              }}
            >
              Get in touch
            </span>
            <h2>
              프로젝트를<br />
              시작하세요.
            </h2>
            <p>간단한 정보를 남겨주시면 24시간 내에 무료 견적과 함께 답변드립니다.</p>

            <div className="contact-items">
              <div className="contact-item">
                <div className="contact-ico">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <div className="contact-label">Email</div>
                  <div className="contact-val">maximpact.it@gmail.com</div>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-ico">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <div className="contact-label">KakaoTalk</div>
                  <div className="contact-val">max-impact</div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-card reveal">
            <form ref={formRef} onSubmit={onSubmit}>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="f-name">이름 / 회사명</label>
                  <input id="f-name" name="name" type="text" placeholder="홍길동" required />
                </div>
                <div className="field">
                  <label htmlFor="f-phone">연락처</label>
                  <input id="f-phone" name="phone" type="tel" placeholder="010-0000-0000" required />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="f-email">이메일</label>
                  <input id="f-email" name="email" type="email" placeholder="hello@example.com" required />
                </div>
                <div className="field">
                  <label htmlFor="f-type">프로젝트 유형</label>
                  <select id="f-type" name="project_type" required defaultValue="">
                    <option value="" disabled>선택해주세요</option>
                    {projectTypes.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="f-desc">프로젝트 설명</label>
                <textarea
                  id="f-desc" name="description" required
                  placeholder="만들고 싶은 서비스에 대해 자유롭게 설명해주세요. 예산, 일정, 참고 사이트 등을 포함하면 더 정확한 견적이 가능합니다."
                />
              </div>
              <button type="submit" className="submit" disabled={submitting}>
                {submitting ? "전송 중..." : "무료 견적 요청하기"}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          </div>

          <div
            className={`thank-toast${toast ? " show" : ""}`}
            role="status" aria-live="polite" aria-hidden={!toast}
          >
            <div className="thank-toast-card">
              <div className="thank-toast-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M7 12.5l3.2 3.2L17 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="thank-toast-text">
                <strong>요청이 정상적으로 접수되었습니다.</strong>
                <span>빠른 시일 내 회신 드리겠습니다.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
