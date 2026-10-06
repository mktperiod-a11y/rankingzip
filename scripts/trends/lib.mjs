// 실시간 트렌드 수집기 공통 도구. 외부 의존성 없이 Node 22 내장 fetch만 사용합니다.

export const USER_AGENT = 'Mozilla/5.0 (compatible; RankingZipBot/1.0; +https://rankingzip.com)';

export async function fetchText(url, { timeoutMs = 15000, headers = {} } = {}) {
  const res = await fetch(url, {
    headers: { 'user-agent': USER_AGENT, 'accept-language': 'ko-KR,ko;q=0.9', ...headers },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`${url} 응답 오류 ${res.status}`);
  return res.text();
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function decodeXml(text = '') {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
    .trim();
}

const escapeTag = (tag) => tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** 태그의 모든 블록(내부 문자열)을 반환합니다. 예: blocks(xml, 'item') */
export function blocks(xml, tag) {
  const re = new RegExp(`<${escapeTag(tag)}(?:\\s[^>]*)?>([\\s\\S]*?)</${escapeTag(tag)}>`, 'g');
  return Array.from(xml.matchAll(re), (m) => m[1]);
}

/** 첫 번째 태그의 텍스트를 디코딩해서 반환합니다. 없으면 빈 문자열. */
export function tagText(xml, tag) {
  return decodeXml(blocks(xml, tag)[0] ?? '');
}

/** 검색어 비교용 키: 공백·대소문자 차이를 무시합니다. */
export const keywordKey = (keyword) => keyword.normalize('NFC').replace(/\s+/g, '').toLowerCase();

/**
 * 모든 소스가 반환하는 공통 항목 형태
 * @typedef {{ title: string, url: string, source?: string, image?: string }} TrendNews
 * @typedef {{ rank: number, keyword: string, url?: string, traffic?: string,
 *             image?: string, startedAt?: string, related?: string[], news: TrendNews[] }} TrendItem
 */
export function trendItem(fields) {
  return { news: [], ...fields, keyword: fields.keyword.trim() };
}
