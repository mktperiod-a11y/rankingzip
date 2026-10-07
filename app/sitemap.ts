import type { MetadataRoute } from "next";
import { pages } from "./rankings/data";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://mktperiod-a11y.github.io/rankingzip";
  return [{url:base,changeFrequency:"weekly",priority:1,lastModified:'2026-08-31'},...pages.filter(p=>!p.noindex).map(p=>({url:`${base}/rankings/${p.slug}`,changeFrequency:"weekly" as const,priority:.8,lastModified:'2026-08-31'}))];
}
