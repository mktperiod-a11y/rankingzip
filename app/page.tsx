import Home from "./home";
import { editorPicks } from "./rankings/editor-picks";
import { getPicks } from "../lib/trends-server";

const kst = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });

export default async function Page() {
  const { picks, trendsAt } = await getPicks(editorPicks);
  const hotDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
  return <Home picks={picks} trendsAt={trendsAt && kst.format(new Date(trendsAt))} hotDay={hotDay} />;
}
