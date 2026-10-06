import Home from "./home";
import { editorPicks } from "./rankings/editor-picks";
import { getPicks } from "../lib/trends-server";

// "지금 주목할 랭킹"은 사이트를 만드는 시점의 실시간 검색어로 채웁니다.
// GitHub Pages에서는 main에 올라오거나 Actions에서 직접 실행할 때 다시 만들어집니다.
export default async function Page() {
  return <Home picks={await getPicks(editorPicks)} />;
}
