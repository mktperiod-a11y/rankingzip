import Home from "./home";
import { getTrends } from "../lib/trends-server";

// 실시간 검색어를 요청 때마다 반영합니다. 소스 호출은 lib/trends-server.ts에서 10분간 캐시됩니다.
export const dynamic = "force-dynamic";

export default async function Page() {
  return <Home trends={await getTrends()} />;
}
