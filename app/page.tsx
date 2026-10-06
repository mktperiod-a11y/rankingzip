import Home from "./home";
import { editorPicks } from "./rankings/editor-picks";
import { getPicks } from "../lib/trends-server";

// "지금 주목할 랭킹"을 실시간 검색어로 채우므로 요청마다 렌더링합니다. 검색어는 lib/trends-server.ts에서 10분간 캐시됩니다.
export const dynamic = "force-dynamic";

export default async function Page() {
  return <Home picks={await getPicks(editorPicks)} />;
}
