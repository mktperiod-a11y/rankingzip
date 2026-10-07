import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots { return {rules:{userAgent:"*",allow:"/"},sitemap:"https://mktperiod-a11y.github.io/rankingzip/sitemap.xml"}; }
