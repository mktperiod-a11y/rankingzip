import Home from "./home";
import { pages, slugByTitle } from "./rankings/data";
import { editorPicks } from "./rankings/editor-picks";
import type { Metadata } from "next";
import { getPicks } from "../lib/trends-server";
import { SITE_URL } from "./links";
import { answerOf } from "./rankings/summary";

export const metadata: Metadata = { alternates: { canonical: "./" } };

const kst = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });

export default async function Page() {
  const { picks, trendsAt } = await getPicks(editorPicks);
  const hotDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
  const catalog = pages.filter(p => !p.noindex).map(p => ({
    slug: p.slug, title: p.title, date: p.date, auditDate: p.auditDate,
    unranked: p.unranked, rows: p.rows.map(r => ({ name: r.name })),
  }));
  const slugs = Object.fromEntries(Object.entries(slugByTitle).filter(([, slug]) => catalog.some(p => p.slug === slug)));
  const listed = pages.filter(p => Object.values(slugs).includes(p.slug));
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${SITE_URL}/#organization`, "name": "순위ZIP", "url": `${SITE_URL}/`, "logo": `${SITE_URL}/icon-192.png` },
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, "url": `${SITE_URL}/`, "name": "순위ZIP", "inLanguage": "ko-KR", "publisher": { "@id": `${SITE_URL}/#organization` } },
      {
        "@type": "CollectionPage", "@id": `${SITE_URL}/`, "url": `${SITE_URL}/`, "name": "순위ZIP", "inLanguage": "ko-KR",
        "isPartOf": { "@id": `${SITE_URL}/#website` },
        "mainEntity": {
          "@type": "ItemList", "numberOfItems": listed.length,
          "itemListElement": listed.map((p, i) => ({ "@type": "ListItem", "position": i + 1, "name": p.title, "url": `${SITE_URL}/rankings/${p.slug}/`, ...(answerOf(p) && { "description": answerOf(p) }) })),
        },
      },
    ],
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <Home pages={catalog} slugByTitle={slugs} picks={picks} trendsAt={trendsAt && kst.format(new Date(trendsAt))} hotDay={hotDay} />
  </>;
}
