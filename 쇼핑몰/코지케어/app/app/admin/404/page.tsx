import Link from "next/link";

export default function Page() {
  return (
    <div
      className="error-page"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "var(--bg-secondary)",
        flexDirection: "column",
        gap: 16,
        textAlign: "center",
      }}
    >
      <div
        className="error-code"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 80,
          fontWeight: 700,
          color: "var(--border)",
        }}
      >
        404
      </div>
      <div
        className="error-title"
        style={{
          fontFamily: "'Inter',sans-serif",
          fontSize: 20,
          fontWeight: 600,
          color: "var(--fg-primary)",
        }}
      >
        요청하신 페이지를 찾을 수 없습니다
      </div>
      <div
        className="error-desc"
        style={{
          fontFamily: "'Inter',sans-serif",
          fontSize: 14,
          color: "var(--fg-muted)",
        }}
      >
        페이지가 존재하지 않거나 이동되었습니다.
        <br />
        주소를 다시 확인해주세요.
      </div>
      <Link
        href="/admin/dashboard"
        className="btn btn-primary"
        style={{ marginTop: 8 }}
      >
        <i className="icon-arrow-left" style={{ fontSize: 16 }}></i> 대시보드로
        돌아가기
      </Link>
    </div>
  );
}
