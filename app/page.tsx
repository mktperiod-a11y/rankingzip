import Home from "./home";
import { pages, slugByTitle } from "./rankings/data";
import { editorPicks } from "./rankings/editor-picks";
import { getPicks } from "../lib/trends-server";

const kst = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });

export default async function Page() {
  const { picks, trendsAt } = await getPicks(editorPicks);
  const hotDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
  const catalog = pages.filter(p => !p.noindex).map(p => ({
    slug: p.slug, title: p.title, date: p.date, auditDate: p.auditDate,
    unranked: p.unranked, rows: p.rows.map(r => ({ name: r.name })),
  }));
  const slugs = Object.fromEntries(Object.entries(slugByTitle).filter(([, slug]) => catalog.some(p => p.slug === slug)));
  return <Home pages={catalog} slugByTitle={slugs} picks={picks} trendsAt={trendsAt && kst.format(new Date(trendsAt))} hotDay={hotDay} />;
}
