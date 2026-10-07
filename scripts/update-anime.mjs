#!/usr/bin/env node
// 애니메이션 순위 두 가지를 공개 자료로 갱신합니다. API 키가 필요 없습니다.
//   node scripts/update-anime.mjs            갱신해서 data/rankings/anime-*.json과 public/ranking-images/anime/에 저장
//   node scripts/update-anime.mjs --dry-run  저장하지 않고 결과만 출력
// - 역대 인기 애니메이션: AniList 회원이 자기 목록에 담은 수(popularity). 같은 작품의 후속 시즌·외전은 첫 작품 하나만 셉니다.
// - 이번 시즌 인기 애니메이션: Anime Corner 주간 팬 투표 최신 회차의 득표율. 새 회차가 없으면 바꾸지 않습니다.
// 한국어 제목은 data/rankings/anime-titles-ko.json(AniList 작품 번호 또는 영어 제목 → 한국어 제목)에서 먼저 찾고,
// 없으면 위키데이터의 한국어 이름을 씁니다. 둘 다 없으면 영어 제목을 그대로 저장하고 목록을 출력합니다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ALL_TIME_FILE = 'data/rankings/anime-all-time.json';
const WEEKLY_FILE = 'data/rankings/anime-weekly.json';
const TITLES_KO = 'data/rankings/anime-titles-ko.json';
const IMAGE_DIR = 'public/ranking-images/anime';
const RANKINGS_PAGE = 'https://animecorner.me/category/anime-corner/rankings/';
const UA = 'RankingZipBot/1.0 (https://mktperiod-a11y.github.io/rankingzip/)';
const TOP = 10;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const today = () => new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);

const decode = (s) => s.replace(/<[^>]+>/g, '').replace(/&#8217;|&rsquo;/g, '’').replace(/&#8211;|&ndash;/g, '–').replace(/&#038;|&amp;/g, '&').replace(/&#8220;|&#8221;|&quot;/g, '"').replace(/&#039;|&#8216;/g, "'").replace(/\s+/g, ' ').trim();

/** Anime Corner 순위 목록 페이지에서 가장 최근 주간 투표 글 주소 */
export function latestWeekUrl(html) {
  const m = html.match(/href="(https:\/\/animecorner\.me\/[a-z]+-\d{4}-anime-rankings-week-\d+\/?)"/);
  if (!m) throw new Error('주간 투표 글을 찾지 못했습니다');
  return m[1];
}

/** 주간 투표 글에서 시즌·회차·발표일과 순위표를 뽑습니다. */
export function parseWeekly(html, url) {
  const head = url.match(/\/([a-z]+)-(\d{4})-anime-rankings-week-(\d+)/);
  if (!head) throw new Error(`주소 형식이 다릅니다: ${url}`);
  const table = html.match(/<table[\s\S]*?<\/table>/)?.[0];
  if (!table || !/>\s*Votes\s*</.test(table)) throw new Error('득표율 표를 찾지 못했습니다');
  const rows = [...table.matchAll(/<tr>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/g)].map((m) => ({
    rank: Number(decode(m[1]).replace(/\D/g, '')), title: decode(m[2]), votes: decode(m[3]),
  }));
  if (rows.length < TOP || rows.some((r, i) => !r.rank || !r.title || !/^\d+(\.\d+)?%$/.test(r.votes) || (i && r.rank < rows[i - 1].rank))) throw new Error('순위표 형식이 예상과 다릅니다');
  return {
    source: url,
    season: head[1], year: Number(head[2]), week: Number(head[3]),
    publishedAt: html.match(/article:published_time" content="(\d{4}-\d{2}-\d{2})/)?.[1] ?? '',
    rows: rows.slice(0, TOP),
  };
}

const norm = (s = '') => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
/** 같은 작품의 후속 시즌·외전을 뺍니다: 이미 고른 작품과 이어지는 관계이거나 제목이 그 작품 제목으로 시작하면 뺍니다. */
export function pickFranchiseLeaders(media, count = TOP) {
  const picked = [];
  for (const m of media) {
    const names = [m.title.english, m.title.romaji].filter(Boolean).map(norm);
    const related = (m.relations?.edges ?? []).some((e) => ['PREQUEL', 'PARENT', 'SEQUEL', 'SIDE_STORY', 'ALTERNATIVE'].includes(e.relationType) && picked.some((p) => p.id === e.node.id));
    const sameName = picked.some((p) => [p.title.english, p.title.romaji].filter(Boolean).map(norm).some((base) => names.some((n) => n === base || n.startsWith(`${base} `))));
    if (!related && !sameName) picked.push(m);
    if (picked.length === count) break;
  }
  return picked;
}

async function anilist(query, variables = {}) {
  await wait(800); // AniList 요청 제한(분당 90회)을 넘지 않게 천천히 보냅니다.
  const res = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`AniList ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(`AniList ${json.errors[0]?.message}`);
  return json.data;
}

const FIELDS = 'id idMal title { romaji english native } popularity startDate { year } format coverImage { extraLarge large } siteUrl';

/** 위키데이터에서 AniList·MyAnimeList 번호로 한국어 이름을 찾습니다. */
async function wikidataKo(m) {
  const q = `SELECT ?l WHERE { { ?i wdt:P8729 "${m.id}" } UNION { ?i wdt:P4086 "${m.idMal ?? 0}" } ?i rdfs:label ?l FILTER(lang(?l)="ko") } LIMIT 1`;
  try {
    const res = await fetch(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(q)}`, { headers: { 'user-agent': UA, accept: 'application/sparql-results+json' }, signal: AbortSignal.timeout(30000) });
    return res.ok ? (await res.json()).results.bindings[0]?.l?.value : undefined;
  } catch { return undefined; }
}

async function saveCover(m, dryRun) {
  const url = m.coverImage?.extraLarge || m.coverImage?.large;
  if (!url) return undefined;
  const file = `${IMAGE_DIR}/${m.id}${path.extname(new URL(url).pathname) || '.jpg'}`;
  if (!dryRun && !fs.existsSync(file)) {
    const res = await fetch(url, { headers: { 'user-agent': UA } });
    if (!res.ok) return undefined;
    fs.mkdirSync(IMAGE_DIR, { recursive: true });
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  return `/${file.replace(/^public\//, '')}`;
}

async function describe(m, manual, missing, dryRun, sourceTitle) {
  const titleKo = manual[m.id] ?? manual[sourceTitle] ?? (await wikidataKo(m));
  if (!titleKo) missing.push(`${m.id} ${m.title.english ?? m.title.romaji}`);
  return { id: m.id, ...(titleKo ? { titleKo } : {}), image: await saveCover(m, dryRun), url: m.siteUrl };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const manual = JSON.parse(fs.readFileSync(TITLES_KO, 'utf8'));
  const missing = [];

  // 역대 인기
  const { Page } = await anilist(`{ Page(perPage: 50) { media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) { ${FIELDS} relations { edges { relationType node { id } } } } } }`);
  const leaders = pickFranchiseLeaders(Page.media);
  if (leaders.length < TOP) throw new Error('AniList 결과가 부족합니다');
  const allTime = { source: 'https://anilist.co/search/anime/popular', checkedAt: today(), rows: [] };
  for (const [i, m] of leaders.entries()) {
    allTime.rows.push({ rank: i + 1, title: m.title.english ?? m.title.romaji, popularity: m.popularity, year: m.startDate?.year ?? null, format: m.format, ...(await describe(m, manual, missing, dryRun)) });
  }

  // 이번 시즌 주간 투표
  const list = await (await fetch(RANKINGS_PAGE, { headers: { 'user-agent': UA } })).text();
  const url = latestWeekUrl(list);
  const previous = fs.existsSync(WEEKLY_FILE) ? JSON.parse(fs.readFileSync(WEEKLY_FILE, 'utf8')) : null;
  let weekly = previous;
  if (previous?.source !== url) {
    const week = parseWeekly(await (await fetch(url, { headers: { 'user-agent': UA } })).text(), url);
    weekly = { ...week, checkedAt: today(), rows: [] };
    for (const r of week.rows) {
      const found = await anilist(`query ($q: String) { Media(search: $q, type: ANIME, sort: SEARCH_MATCH) { ${FIELDS} } }`, { q: r.title }).catch(() => null);
      weekly.rows.push({ ...r, ...(found?.Media ? await describe(found.Media, manual, missing, dryRun, r.title) : manual[r.title] ? { titleKo: manual[r.title] } : {}) });
      if (!found?.Media && !manual[r.title]) missing.push(r.title);
    }
  } else console.log(`주간 투표: 새 회차 없음 (${url})`);

  console.log(JSON.stringify({ allTime: allTime.rows.map((r) => `${r.rank}. ${r.titleKo ?? r.title} ${r.popularity}`), weekly: weekly?.rows.map((r) => `${r.rank}. ${r.titleKo ?? r.title} ${r.votes}`) }, null, 1));
  if (missing.length) console.log(`한국어 제목 없음 → ${TITLES_KO}에 추가하세요:\n${missing.join('\n')}`);
  if (dryRun) return;
  // 역대 순위는 같은 날 다시 돌려도 수치만 바뀌므로 그대로 덮어씁니다.
  fs.writeFileSync(ALL_TIME_FILE, `${JSON.stringify(allTime, null, 2)}\n`);
  if (weekly) fs.writeFileSync(WEEKLY_FILE, `${JSON.stringify(weekly, null, 2)}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main().catch((e) => { console.error(e); process.exit(1); });
