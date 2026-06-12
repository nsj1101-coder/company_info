import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  basePath: "/cozycare",
  assetPrefix: "/cozycare",
  outputFileTracingRoot: path.join(__dirname),
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn-pro-web-250-117.cdn-nhncommerce.com' },
    ],
  },
};

export default nextConfig;
