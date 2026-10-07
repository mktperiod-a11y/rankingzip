import Home from "./home";
import { editorPicks } from "./rankings/editor-picks";
import { getPicks } from "../lib/trends-server";

// "지금 주목할 랭킹"은 사이트를 만드는 시점의 실시간 검색어로 채웁니다.
// GitHub Pages에서는 main에 올라오거나 Actions에서 직접 실행할 때 다시 만들어집니다.
const kst = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });

export default async function Page() {
  const { picks, trendsAt, trendSlugs } = await getPicks(editorPicks);
  return <Home picks={picks} trendsAt={trendsAt && kst.format(new Date(trendsAt))} trendSlugs={trendSlugs} />;
}
