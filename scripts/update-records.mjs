#!/usr/bin/env node
// 직접 확인하던 순위를 공개 원자료로 자동 갱신합니다. API 키가 필요 없습니다.
//   node scripts/update-records.mjs                 모든 원자료를 받아 data/rankings/live/<순위 주소>.json에 저장
//   node scripts/update-records.mjs --dry-run       저장하지 않고 결과만 출력
//   node scripts/update-records.mjs --only kbo,ufc  일부만 실행
// 원자료마다 따로 실행해 한 곳이 실패해도 나머지는 저장합니다. 형식이 예상과 다르면 그 순위는 저장하지 않습니다.
// 화면 문구(설명·FAQ)는 app/rankings/live.ts가 이 데이터로 만듭니다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = 'data/rankings/live';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const TOP = 10;
export const today = () => new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
const text = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;|&#039;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const num = (s) => Number(String(s).replace(/[^\d.]/g, ''));
function check(cond, msg) { if (!cond) throw new Error(msg); }

// ── 게임트릭스: 전국 PC방 게임 이용 시간 점유율 (매일 발표) ──────────────────────────
export function parseGametrics(html) {
  const day = html.match(/id="lb_rank_date">(\d{4})년 (\d{1,2})월 (\d{1,2})일/);
  check(day, '게임트릭스: 기준일 없음');
  const first = { name: text(html.match(/id="lb_rank_programname"[^>]*>([^<]+)</)?.[1] ?? ''), share: num(html.match(/id="lb_rank_useratio">([\d.]+)</)?.[1] ?? '') };
  const block = html.slice(html.indexOf('lb_rank_useratio'));
  const rest = [...block.matchAll(/gamename=[^"]+">([^<]+)<\/a><\/td>\s*<\/tr>\s*<\/table><\/td>\s*<td[^>]*>\s*<table[^>]*>\s*<tr>\s*<td align="right">([\d.]+)%/g)].slice(0, TOP - 1).map((m) => ({ name: text(m[1]), share: num(m[2]) }));
  const rows = [first, ...rest].map((r, i) => ({ rank: i + 1, ...r }));
  check(rows.length === TOP && rows.every((r, i) => r.name && r.share > 0 && (!i || r.share <= rows[i - 1].share)), '게임트릭스: 순위표 형식이 다릅니다');
  return { date: `${day[1]}-${day[2].padStart(2, '0')}-${day[3].padStart(2, '0')}`, rows };
}

// ── KOBIS: 연도별·역대 박스오피스 ────────────────────────────────────────────
export function parseKobis(html) {
  const rows = [...html.matchAll(/<td id="td_rank">\s*(\d+)\s*<\/td>\s*<td id="td_movie"[^>]*>[\s\S]*?mstView\('movie','(\d+)'\)[^>]*title="([^"]+)"[\s\S]*?<td id="td_openDt">\s*([\d-]*)\s*<\/td>[\s\S]*?<td id="td_audiAcc"[^>]*>\s*([\d,]+)\s*<\/td>/g)]
    .slice(0, TOP).map((m) => ({ rank: Number(m[1]), title: text(m[3]), movieCd: m[2], openDt: m[4], audience: num(m[5]) }));
  check(rows.length === TOP && rows.every((r, i) => r.rank === i + 1 && r.audience > 0), 'KOBIS: 순위표 형식이 다릅니다');
  return { rows };
}

// ── Box Office Mojo: 연도별 전 세계 흥행 ─────────────────────────────────────
export function parseMojoWorld(html) {
  const rows = [...html.matchAll(/mojo-field-type-rank[^>]*>(\d+)<\/td><td class="a-text-left mojo-field-type-release_group"><a class="a-link-normal" href="[^"]*">([^<]+)<\/a><\/td><td class="a-text-right mojo-field-type-money">\$([\d,]+)<\/td>/g)]
    .slice(0, TOP).map((m) => ({ rank: Number(m[1]), title: text(m[2]), gross: num(m[3]) }));
  check(rows.length === TOP && rows.every((r, i) => r.rank === i + 1 && r.gross > 0), 'Box Office Mojo: 순위표 형식이 다릅니다');
  return { rows };
}

// ── The Numbers: 스파이더맨 시리즈 전 세계 흥행 (개봉작만, 묶음 상영 제외) ────────────
export function parseNumbersFranchise(html) {
  const seen = new Set();
  const films = [...html.matchAll(/<tr>\s*<td>([^<]*)<\/td>\s*<td><b><a href="([^"]+)">([^<]+)<\/a><\/b><\/td>(?:\s*<td class='data'>([^<]*)<\/td>){4}/g)]
    .map((m) => ({ released: text(m[1]), url: m[2], title: text(m[3]), gross: num(m[4]) }))
    .filter((f) => f.gross > 0 && !/double-bill/i.test(f.title) && !seen.has(f.url) && seen.add(f.url));
  const rows = films.sort((a, b) => b.gross - a.gross).slice(0, TOP).map((f, i) => ({ rank: i + 1, title: f.title.replace(/ 3D$/, ''), year: Number(f.released.match(/\d{4}/)?.[0]) || null, gross: f.gross }));
  check(rows.length === TOP, 'The Numbers: 작품 수가 부족합니다');
  return { rows };
}

// ── 다나와자동차: 국산차 모델별 월간 판매 ─────────────────────────────────────
const BRAND = { 303: '현대', 304: '제네시스', 307: '기아', 312: '쉐보레', 321: '르노코리아', 326: 'KGM' };
export function parseDanawa(html, month) {
  const rows = [...html.matchAll(/<tr>\s*<td><input type='checkbox'[^>]*title='([^']+)' brand='(\d+)'><\/td>\s*<td class='rank'>(\d+)<\/td>[\s\S]*?<img src='([^']+)'[\s\S]*?<td class='num'>([\d,]+)/g)]
    .map((m) => ({ name: text(m[1]), brand: BRAND[m[2]], rank: Number(m[3]), image: m[4], sales: num(m[5]) }))
    .filter((r) => r.brand && !/^버스|트럭/.test(r.name)).slice(0, TOP).map((r, i) => ({ ...r, rank: i + 1 }));
  check(rows.length === TOP && rows.every((r, i) => r.sales > 0 && (!i || r.sales <= rows[i - 1].sales)), '다나와: 순위표 형식이 다릅니다');
  return { month, rows };
}

// ── KBO: 팀 순위·타자 기록 ─────────────────────────────────────────────────
export function parseKboTeams(html) {
  const body = html.slice(html.indexOf('<tbody>'), html.indexOf('</tbody>'));
  const rows = [...body.matchAll(/<tr>\s*<td>(\d+)<\/td>\s*<td>([^<]+)<\/td>\s*<td>(\d+)<\/td>\s*<td>(\d+)<\/td>\s*<td>(\d+)<\/td>\s*<td>(\d+)<\/td>\s*<td>([\d.]+)<\/td>\s*<td>([\d.-]+)<\/td>/g)]
    .map((m) => ({ rank: Number(m[1]), team: text(m[2]), games: Number(m[3]), win: Number(m[4]), loss: Number(m[5]), draw: Number(m[6]), pct: m[7], behind: m[8] }));
  check(rows.length === 10, 'KBO 팀 순위: 10개 구단이 아닙니다');
  return { rows };
}
export function parseKboHitters(html, stat) {
  const rows = [...html.matchAll(/<tr>\s*<td>(\d+)<\/td>\s*<td><a href="[^"]*playerId=(\d+)">([^<]+)<\/a><\/td>\s*<td>([^<]+)<\/td>[\s\S]*?<td data-id="(?:HR_CN)">(\d+)<\/td>[\s\S]*?<td data-id="RBI_CN">(\d+)<\/td>/g)]
    .map((m) => ({ rank: Number(m[1]), playerId: m[2], name: text(m[3]), team: text(m[4]), hr: Number(m[5]), rbi: Number(m[6]) }));
  const key = stat === 'hr' ? 'hr' : 'rbi';
  const sorted = rows.slice(0, TOP);
  check(sorted.length === TOP && sorted.every((r, i) => !i || r[key] <= sorted[i - 1][key]), `KBO ${stat}: 순위표 형식이 다릅니다`);
  return { rows: sorted.map((r) => ({ rank: r.rank, playerId: r.playerId, name: r.name, team: r.team, value: r[key] })) };
}

// ── UFC: 공식 랭킹(미디어 패널) 남성부 8개 체급 ────────────────────────────────
export const UFC_DIVISIONS = { Flyweight: '플라이급', Bantamweight: '밴텀급', Featherweight: '페더급', Lightweight: '라이트급', Welterweight: '웰터급', Middleweight: '미들급', 'Light Heavyweight': '라이트헤비급', Heavyweight: '헤비급' };
export function parseUfc(html) {
  const groups = html.split('view-grouping-header">').slice(1);
  const divisions = [];
  for (const g of groups) {
    const name = text(g.slice(0, g.indexOf('<')));
    // 같은 랭킹이 페이지 아래에 한 번 더(내용 없이) 나오므로 처음 것만 씁니다.
    if (!UFC_DIVISIONS[name] || divisions.some((d) => d.division === name)) continue;
    const champion = text(g.match(/rankings--athlete--champion[\s\S]*?<h5><a[^>]*>([^<]+)<\/a><\/h5>/)?.[1] ?? '');
    const contenders = [...g.matchAll(/views-field-weight-class-rank">(\d+)\s*<\/td>\s*<td class="views-field views-field-title"><a[^>]*>([^<]+)<\/a>/g)].slice(0, 3).map((m) => text(m[2]));
    divisions.push({ division: name, champion, contenders });
  }
  check(divisions.length === 8 && divisions.every((d) => d.champion && d.contenders.length === 3), 'UFC: 체급 랭킹 형식이 다릅니다');
  return { divisions };
}

// ── 실행 ─────────────────────────────────────────────────────────────────
async function get(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'ko-KR,ko;q=0.9,en;q=0.8' }, signal: AbortSignal.timeout(45000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}
const lastMonth = () => { const d = new Date(Date.now() + 9 * 3600000); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - 1); return d.toISOString().slice(0, 7); };

export const SOURCES = {
  pcbang: async () => ({ 'korea-pc-games-share': { source: 'https://www.gametrics.com/', ...parseGametrics(await get('https://www.gametrics.com/')) } }),
  kobis: async () => {
    const yearly = 'https://www.kobis.or.kr/kobis/business/stat/boxs/findYearlyBoxOfficeList.do?loadEnd=0&searchType=search&sSearchYearFrom=';
    const former = 'https://www.kobis.or.kr/kobis/business/stat/boxs/findFormerBoxOfficeList.do?loadEnd=0&searchType=search';
    const year = today().slice(0, 4);
    return {
      'korea-box-office-2026': { source: yearly + year, year: Number(year), ...parseKobis(await get(yearly + year)) },
      'korean-movie-admissions': { source: former, ...parseKobis(await get(former)) },
    };
  },
  mojo: async () => { const url = `https://www.boxofficemojo.com/year/world/${today().slice(0, 4)}/`; return { 'worldwide-box-office-2026': { source: url, ...parseMojoWorld(await get(url)) } }; },
  spiderman: async () => { const url = 'https://www.the-numbers.com/movies/franchise/Spider-Man'; return { 'spider-man-worldwide-box-office': { source: url, ...parseNumbersFranchise(await get(url)) } }; },
  danawa: async () => {
    for (const month of [lastMonth(), (() => { const [y, m] = lastMonth().split('-').map(Number); return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`; })()]) {
      const url = `https://auto.danawa.com/auto/?Work=record&Tab=Model&Month=${month}-00`;
      let data;
      try { data = parseDanawa(await get(url), month); } catch (e) { console.log(`다나와 ${month}: ${e.message}`); continue; }
      // 모델 사진은 다나와 이미지를 받아 둡니다(처음 보는 모델만).
      for (const r of data.rows) {
        const id = r.image.match(/photo\/(\d+)\//)?.[1];
        if (!id) continue;
        const file = `public/ranking-images/cars/${id}.png`;
        if (!fs.existsSync(file) && !process.argv.includes('--dry-run')) {
          const res = await fetch(r.image, { headers: { 'user-agent': UA } }).catch(() => null);
          if (res?.ok) { fs.mkdirSync('public/ranking-images/cars', { recursive: true }); fs.writeFileSync(file, Buffer.from(await res.arrayBuffer())); }
        }
        if (fs.existsSync(file)) r.local = `/${file.replace(/^public\//, '')}`;
      }
      return { 'korea-car-sales': { source: url, ...data } };
    }
    throw new Error('다나와: 최근 두 달 자료가 없습니다');
  },
  kbo: async () => {
    const base = 'https://www.koreabaseball.com/Record/';
    return {
      'kbo-team-standings-2026': { source: `${base}TeamRank/TeamRankDaily.aspx`, ...parseKboTeams(await get(`${base}TeamRank/TeamRankDaily.aspx`)) },
      'kbo-home-runs-2026': { source: `${base}Player/HitterBasic/Basic1.aspx?sort=HR_CN`, ...parseKboHitters(await get(`${base}Player/HitterBasic/Basic1.aspx?sort=HR_CN`), 'hr') },
      'kbo-rbi-2026': { source: `${base}Player/HitterBasic/Basic1.aspx?sort=RBI_CN`, ...parseKboHitters(await get(`${base}Player/HitterBasic/Basic1.aspx?sort=RBI_CN`), 'rbi') },
    };
  },
  ufc: async () => ({ 'ufc-rankings-by-division': { source: 'https://www.ufc.com/rankings', ...parseUfc(await get('https://www.ufc.com/rankings')) } }),
};

/** 숫자·순위가 그대로면 파일을 바꾸지 않습니다(확인 날짜만 바뀌는 커밋을 막습니다). */
function save(slug, data, dryRun) {
  const file = path.join(OUT, `${slug}.json`);
  const before = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
  const strip = ({ checkedAt, ...rest }) => JSON.stringify(rest);
  if (before && strip(before) === strip(data)) { console.log(`= ${slug}: 바뀐 내용 없음`); return; }
  console.log(`✓ ${slug}: 갱신`);
  if (!dryRun) { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(file, `${JSON.stringify({ ...data, checkedAt: today() }, null, 2)}\n`); }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const only = process.argv.find((a, i) => process.argv[i - 1] === '--only')?.split(',');
  const failed = [];
  for (const [key, run] of Object.entries(SOURCES)) {
    if (only && !only.includes(key)) continue;
    try {
      for (const [slug, data] of Object.entries(await run())) { if (dryRun) console.log(slug, JSON.stringify(data).slice(0, 400)); save(slug, data, dryRun); }
    } catch (e) { failed.push(key); console.log(`::warning title=${key} 갱신 실패::${e.message}`); }
  }
  if (failed.length) console.log(`실패: ${failed.join(', ')} (이전 데이터 유지)`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main().catch((e) => { console.error(e); process.exit(1); });
