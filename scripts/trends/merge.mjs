import { keywordKey } from './lib.mjs';

/**
 * 여러 소스의 순위를 하나로 합칩니다.
 * 소스마다 1위=1점, 꼴찌=1/N점으로 환산해 더하므로 여러 곳에서 동시에 뜬 검색어가 위로 올라갑니다.
 */
export function mergeSources(results) {
  const byKey = new Map();
  for (const { id, items } of results) {
    for (const item of items) {
      const key = keywordKey(item.keyword);
      const entry = byKey.get(key) ?? { keyword: item.keyword, score: 0, sources: [], news: [], image: undefined };
      entry.score += (items.length - item.rank + 1) / items.length;
      entry.sources.push({ id, rank: item.rank, url: item.url });
      entry.image ??= item.image;
      for (const news of item.news) if (!entry.news.some((n) => n.url === news.url)) entry.news.push(news);
      byKey.set(key, entry);
    }
  }
  return [...byKey.values()]
    .sort((a, b) => b.sources.length - a.sources.length || b.score - a.score)
    .map(({ score, ...entry }, i) => ({ rank: i + 1, ...entry, score: Math.round(score * 1000) / 1000 }));
}
