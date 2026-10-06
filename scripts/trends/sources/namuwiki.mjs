// 나무위키 실시간 검색어 순위 (사이트 사이드바가 쓰는 공개 JSON, 공식 API 아님)
import { fetchText, trendItem } from '../lib.mjs';

export const id = 'namuwiki';
export const label = '나무위키 실시간 검색어';
export const homepage = 'https://namu.wiki/';
export const rankingUrl = 'https://search.namu.wiki/api/ranking';

export const docUrl = (keyword) => `https://namu.wiki/w/${encodeURIComponent(keyword)}`;

/** 응답은 보통 ["검색어", ...] 배열이며, 객체 배열({keyword|title|name})도 허용합니다. */
export function parse(body) {
  const data = typeof body === 'string' ? JSON.parse(body) : body;
  const list = Array.isArray(data) ? data : data?.ranking ?? data?.data ?? [];
  return list
    .map((entry) => (typeof entry === 'string' ? entry : entry?.keyword ?? entry?.title ?? entry?.name ?? ''))
    .map((keyword) => String(keyword).trim())
    .filter(Boolean)
    .map((keyword, i) => trendItem({ rank: i + 1, keyword, url: docUrl(keyword) }));
}

export async function collect() {
  return parse(await fetchText(rankingUrl, {
    headers: { accept: 'application/json', referer: 'https://namu.wiki/' },
  }));
}
