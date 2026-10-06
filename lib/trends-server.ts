import { pages } from "../app/rankings/data";
import { TREND_SOURCES, matchRanking, mergeTrends, type TrendItem, type TrendSnapshot, type TrendSourceId } from "./trends";

// 소스는 약 10분마다 갱신되므로 같은 주기로 다시 받습니다. 실패한 소스는 직전 결과를 계속 씁니다.
const REFRESH_MS = 10 * 60 * 1000;
const RETRY_MS = 60 * 1000;
const TIMEOUT_MS = 4000;
const USER_AGENT = "Mozilla/5.0 (compatible; RankingZipBot/1.0; +https://rankingzip.pidinfo.chatgpt.site)";

type SourceState = { items: TrendItem[]; fetchedAt: string };
const lastGood = new Map<TrendSourceId, SourceState>();
let snapshot: TrendSnapshot | undefined;
let nextRefreshAt = 0;
let inflight: Promise<TrendSnapshot> | undefined;

async function fetchSource(source: (typeof TREND_SOURCES)[number]) {
  const res = await fetch(source.url, {
    headers: { "user-agent": USER_AGENT, "accept-language": "ko-KR,ko;q=0.9", ...source.headers },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`${source.id} ${res.status}`);
  const items = source.parse(await res.text());
  if (!items.length) throw new Error(`${source.id} empty`);
  return items;
}

async function refresh(): Promise<TrendSnapshot> {
  const now = new Date().toISOString();
  const results = await Promise.allSettled(TREND_SOURCES.map(fetchSource));
  let failed = false;
  results.forEach((result, i) => {
    if (result.status === "fulfilled") lastGood.set(TREND_SOURCES[i].id, { items: result.value, fetchedAt: now });
    else { failed = true; console.warn(`[trends] ${TREND_SOURCES[i].id} 수집 실패:`, result.reason); }
  });
  const trends = mergeTrends(TREND_SOURCES.flatMap((s) => {
    const state = lastGood.get(s.id);
    return state ? [{ id: s.id, items: state.items }] : [];
  })).map((trend) => ({ ...trend, news: trend.news.slice(0, 3), ranking: matchRanking(trend.keyword, pages) }));
  snapshot = {
    updatedAt: now,
    sources: TREND_SOURCES.map((s, i) => ({
      id: s.id, label: s.label, homepage: s.homepage,
      ok: results[i].status === "fulfilled",
      count: lastGood.get(s.id)?.items.length ?? 0,
      fetchedAt: lastGood.get(s.id)?.fetchedAt,
    })),
    trends,
  };
  nextRefreshAt = Date.now() + (failed && !trends.length ? RETRY_MS : REFRESH_MS);
  return snapshot;
}

/** 최신 실시간 검색어. 캐시가 유효하면 즉시 돌려주고, 만료됐으면 소스를 다시 받습니다. */
export async function getTrends(): Promise<TrendSnapshot> {
  if (snapshot && Date.now() < nextRefreshAt) return snapshot;
  inflight ??= refresh().finally(() => { inflight = undefined; });
  return inflight;
}
