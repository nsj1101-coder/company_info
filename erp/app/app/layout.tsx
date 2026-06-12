import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "라린느 통합 ERP",
  description: "라린느 의류 제조·유통 통합 업무 시스템",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
