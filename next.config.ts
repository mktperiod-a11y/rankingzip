import type { NextConfig } from "next";

const nextConfig: NextConfig = process.env.GITHUB_PAGES === "1"
  ? { output: "export", trailingSlash: true, images: { unoptimized: true } }
  : {};

export default nextConfig;
