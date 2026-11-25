import type { Metadata, Viewport } from "next";
import "./globals.css";
import {
  siteMetadata,
  jsonLdOrganization,
  jsonLdProfessionalService,
  jsonLdWebSite,
  jsonLdFaq,
  jsonLdBreadcrumb,
} from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = siteMetadata;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ff5722",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
          rel="stylesheet"
        />
        <JsonLd data={jsonLdOrganization} />
        <JsonLd data={jsonLdProfessionalService} />
        <JsonLd data={jsonLdWebSite} />
        <JsonLd data={jsonLdFaq} />
        <JsonLd data={jsonLdBreadcrumb} />
      </head>
      <body>{children}</body>
    </html>
  );
}
