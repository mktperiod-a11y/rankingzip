// 실시간 인기 검색어: 소스 응답 해석, 소스 간 통합, 우리 순위 페이지 연결, 홈 화면 "지금 주목할 랭킹" 자동 선정.
// 네트워크와 캐시는 lib/trends-server.ts가 맡고, 이 파일은 입력→출력만 다루는 순수 함수만 둡니다.

export type TrendNews = { title: string; url: string; source?: string };
export type TrendItem = { rank: number; keyword: string; traffic?: string; startedAt?: string; news: TrendNews[] };
export type TrendSourceId = "google" | "namuwiki";
export type TrendSource = { id: TrendSourceId; label: string; homepage: string; url: string; headers?: Record<string, string>; parse: (body: string) => TrendItem[] };
export type TrendRankingLink = { slug: string; title: string; row: number };
export type Trend = {
  rank: number;
  keyword: string;
  sources: { id: TrendSourceId; rank: number }[];
  traffic?: string;
  startedAt?: string;
  news: TrendNews[];
  ranking?: TrendRankingLink;
};
export type TrendSourceStatus = { id: TrendSourceId; label: string; homepage: string; ok: boolean; count: number; fetchedAt?: string };
export type TrendSnapshot = { updatedAt: string; sources: TrendSourceStatus[]; trends: Trend[] };
export type RankingCandidate = { slug: string; title: string; noindex?: boolean; unranked?: boolean; rows: { name: string; value: string; rank?: number }[] };
/** 홈 화면 주목할 랭킹 한 줄: [제목, 순위 이름, 라벨, 순위 slug] */
export type Pick = [headline: string, subtitle: string, label: string, slug: string];

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function decodeXml(text = "") {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, name: string) => ENTITIES[name.toLowerCase()] ?? m)
    .trim();
}

function blocks(xml: string, tag: string) {
  const t = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return Array.from(xml.matchAll(new RegExp(`<${t}(?:\\s[^>]*)?>([\\s\\S]*?)</${t}>`, "g")), (m) => m[1]);
}

const tagText = (xml: string, tag: string) => decodeXml(blocks(xml, tag)[0] ?? "");

/** 구글 트렌드 급상승 검색어 RSS (trends.google.co.kr/trending/rss?geo=KR) */
export function parseGoogleTrends(xml: string): TrendItem[] {
  return blocks(xml, "item")
    .map((item) => {
      const pubDate = tagText(item, "pubDate");
      const started = pubDate ? new Date(pubDate) : undefined;
      return {
        keyword: tagText(item, "title"),
        traffic: tagText(item, "ht:approx_traffic") || undefined,
        startedAt: started && !Number.isNaN(started.getTime()) ? started.toISOString() : undefined,
        news: blocks(item, "ht:news_item")
          .map((n) => ({ title: tagText(n, "ht:news_item_title"), url: tagText(n, "ht:news_item_url"), source: tagText(n, "ht:news_item_source") || undefined }))
          .filter((n) => n.title && /^https?:\/\//.test(n.url)),
      };
    })
    .filter((item) => item.keyword)
    .map((item, i) => ({ rank: i + 1, ...item }));
}

/** 나무위키 실시간 검색어 (search.namu.wiki/api/ranking). 보통 문자열 배열이며 객체 배열도 허용합니다. */
export function parseNamuwiki(body: string): TrendItem[] {
  const data: unknown = JSON.parse(body);
  const list: unknown[] = Array.isArray(data) ? data : ((data as { ranking?: unknown[]; data?: unknown[] })?.ranking ?? (data as { data?: unknown[] })?.data ?? []);
  return list
    .map((entry) => {
      if (typeof entry === "string") return entry;
      const e = entry as { keyword?: unknown; title?: unknown; name?: unknown } | null;
      return String(e?.keyword ?? e?.title ?? e?.name ?? "");
    })
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .map((keyword, i) => ({ rank: i + 1, keyword, news: [] }));
}

export const TREND_SOURCES: TrendSource[] = [
  { id: "google", label: "구글 트렌드", homepage: "https://trends.google.co.kr/trending?geo=KR", url: "https://trends.google.co.kr/trending/rss?geo=KR", parse: parseGoogleTrends },
  { id: "namuwiki", label: "나무위키", homepage: "https://namu.wiki/", url: "https://search.namu.wiki/api/ranking", headers: { accept: "application/json", referer: "https://namu.wiki/" }, parse: parseNamuwiki },
];

/** 검색어 비교용 키: 띄어쓰기·대소문자·기호와 나무위키식 괄호 설명("오디세이(2026 영화)")을 무시합니다. */
export const keywordKey = (text: string) => text.normalize("NFC").toLowerCase()
  .replace(/(.+?)\s*\([^)]*\)\s*$/, "$1")
  .replace(/[\s·・()[\]{}'"`.,:;!?~\-_/&+]/g, "");

/**
 * 여러 소스의 순위를 하나로 합칩니다. 소스마다 1위=1점, 꼴찌=1/N점으로 환산해 더하고,
 * 여러 소스에 동시에 오른 검색어를 먼저 놓습니다.
 */
export function mergeTrends(results: { id: TrendSourceId; items: TrendItem[] }[]): Trend[] {
  const byKey = new Map<string, Trend>();
  const scores = new Map<string, number>();
  for (const { id, items } of results) {
    for (const item of items) {
      const key = keywordKey(item.keyword);
      if (!key) continue;
      const entry = byKey.get(key) ?? { rank: 0, keyword: item.keyword, sources: [], news: [] };
      if (entry.sources.some((s) => s.id === id)) continue;
      scores.set(key, (scores.get(key) ?? 0) + (items.length - item.rank + 1) / items.length);
      entry.sources.push({ id, rank: item.rank });
      entry.traffic ??= item.traffic;
      entry.startedAt ??= item.startedAt;
      for (const n of item.news) if (!entry.news.some((x) => x.url === n.url)) entry.news.push(n);
      byKey.set(key, entry);
    }
  }
  const score = (t: Trend) => scores.get(keywordKey(t.keyword)) ?? 0;
  return [...byKey.values()]
    .sort((a, b) => b.sources.length - a.sources.length || score(b) - score(a))
    .map((trend, i) => ({ ...trend, rank: i + 1 }));
}

/**
 * 검색어와 가장 관련 있는 순위 페이지를 찾습니다.
 * 순위 항목 이름과 일치하면 가장 강하게(예: "오디세이" → 국내 영화 흥행), 페이지 제목에 포함되면 그다음으로 연결합니다.
 */
export function matchRanking(keyword: string, pages: RankingCandidate[]): TrendRankingLink | undefined {
  const key = keywordKey(keyword);
  const long = (k: string) => k.length >= (/^[a-z0-9]+$/.test(k) ? 3 : 2);
  if (!long(key) && key.length < 2) return undefined;
  // 점수: 항목 이름 일치 4 > 항목 이름 포함 3 > 제목 포함 2. 동점이면 항목이 위에 있는(더 주목받는) 페이지를 고릅니다.
  let best: { score: number; position: number; page: RankingCandidate } | undefined;
  for (const page of pages) {
    if (page.noindex) continue;
    let score = 0;
    let position = Infinity;
    page.rows.forEach((row, i) => {
      const rowKey = keywordKey(row.name);
      if (!long(rowKey)) return;
      const rowScore = rowKey === key ? 4 : key.includes(rowKey) || (long(key) && rowKey.includes(key)) ? 3 : 0;
      if (rowScore > score || (rowScore && rowScore === score && i < position)) { score = rowScore; position = i; }
    });
    if (!score && long(key) && keywordKey(page.title).includes(key)) { score = 2; position = page.rows.length; }
    if (score && (!best || score > best.score || (score === best.score && position < best.position))) best = { score, position, page };
  }
  // 제목으로만 연결되면 그 순위의 1위 항목을 대표로 씁니다.
  return best && { slug: best.page.slug, title: best.page.title, row: best.score === 2 ? 0 : best.position };
}

const PICK_NEW_MS = 3 * 60 * 60 * 1000;

/**
 * 실시간 검색어와 연결된 순위로 "지금 주목할 랭킹"을 채웁니다.
 * 제목은 연결된 순위 항목의 실제 값으로 만들고(예: "그랜저 8,898대 1위"), 라벨은 3시간 안에 뜬 검색어면 "급상승", 아니면 "화제"입니다.
 * 연결된 순위가 모자라면 편집 선정 목록으로 나머지를 채웁니다.
 */
export function buildPicks(snapshot: TrendSnapshot, pages: RankingCandidate[], fallback: Pick[], count = fallback.length): Pick[] {
  const bySlug = new Map(pages.map((p) => [p.slug, p]));
  const updated = new Date(snapshot.updatedAt).getTime();
  const picks: Pick[] = [];
  for (const trend of snapshot.trends) {
    const page = trend.ranking && bySlug.get(trend.ranking.slug);
    if (!page || !page.rows.length || picks.some((p) => p[3] === page.slug)) continue;
    const index = trend.ranking!.row;
    const row = page.rows[index];
    const place = page.unranked ? "" : ` ${row.rank ?? index + 1}위`;
    const isNew = trend.startedAt && updated - new Date(trend.startedAt).getTime() < PICK_NEW_MS;
    picks.push([`${row.name} ${row.value}${place}`, page.title, isNew ? "급상승" : "화제", page.slug]);
    if (picks.length === count) return picks;
  }
  for (const pick of fallback) {
    if (picks.length === count) break;
    if (!picks.some((p) => p[3] === pick[3])) picks.push(pick);
  }
  return picks;
}
