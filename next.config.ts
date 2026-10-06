import type { NextConfig } from "next";

// GITHUB_PAGES=1 이면 GitHub Pages용 정적 사이트(dist/client)로 내보냅니다. scripts/build-github-pages.mjs 참고.
const nextConfig: NextConfig = process.env.GITHUB_PAGES === "1"
  ? { output: "export", trailingSlash: true, images: { unoptimized: true } }
  : {};

export default nextConfig;
