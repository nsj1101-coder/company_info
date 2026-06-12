import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./icons.css";

export const metadata: Metadata = {
  title: "코지워커 SHOP — 어르신을 위한 본사 직영 복지용구",
  description: "20년 노인 보행기 전문 제조사 ㈜코지케어가 직접 운영하는 복지용구 직영몰",
  icons: {
    icon: "/cozycare/favicon.ico",
  },
};

// 모바일 브라우저(삼성 인터넷/크롬)의 강제 다크모드가 배경을 검게 뒤집는 것을 방지
export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="preload">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.addEventListener('load',function(){document.documentElement.classList.remove('preload');});",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
