import type { NextConfig } from "next";
import path from "path";

// 로컬 dev는 basePath 없이(루트), 실서버 빌드는 NEXT_PUBLIC_BASE_PATH=/lalune-erp 로 빌드
const base = process.env.NEXT_PUBLIC_BASE_PATH;

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  reactStrictMode: true,
  images: { unoptimized: true },
  ...(base ? { basePath: base, assetPrefix: base } : {}),
};

export default nextConfig;
