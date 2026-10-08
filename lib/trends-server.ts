import { pages } from "../app/rankings/data";
import { TREND_SOURCES, buildPicks, matchRanking, mergeTrends, type Pick, type TrendItem, type TrendPick, type TrendSnapshot, type TrendSourceId } from "./trends";

const REFRESH_MS = 10 * 60 * 1000;
const RETRY_MS = 60 * 1000;
const TIMEOUT_MS = 4000;
const USER_AGENT = "Mozilla/5.0 (compatible; RankingZipBot/1.0; +https://mktperiod-a11y.github.io/rankingzip)";

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

export async function getTrends(): Promise<TrendSnapshot> {
  if (snapshot && Date.now() < nextRefreshAt) return snapshot;
  inflight ??= refresh().finally(() => { inflight = undefined; });
  return inflight;
}

export async function getPicks(fallback: Pick[]): Promise<{ picks: TrendPick[]; trendsAt?: string }> {
  const snapshot = await getTrends();
  const picks = buildPicks(snapshot, fallback);
  const live = picks.some((p) => p.live);
  return { picks, trendsAt: live ? snapshot.updatedAt : undefined };
}
