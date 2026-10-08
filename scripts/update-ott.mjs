import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const FILE = 'data/rankings/ott-users.json';
const REQUIRED = ['넷플릭스', '쿠팡플레이', '티빙', '디즈니+', '웨이브', '라프텔', '왓챠'];
const clean = value => value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&middot;/g, '·').replace(/\s+/g, ' ').trim();

export function parseOttReport(info) {
  if (info.categoryType !== 1 || !/표본\s*조사/.test(clean(info.content)) || !/안드로이드|Android/.test(info.content) || !/iOS/.test(info.content)) throw new Error('공개 스마트폰 표본 조사 기준을 확인하지 못했습니다.');
  for (const table of info.content.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)) {
    const rows = [];
    for (const tr of table[0].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const cells = [...tr[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(m => clean(m[1]));
      const value = cells[2]?.match(/^([\d,]+(?:\.\d+)?)만\s*명/);
      if (cells.length !== 3 || !/^\d+$/.test(cells[0]) || !value) continue;
      const users = Math.round(Number(value[1].replaceAll(',', '')) * 10000);
      if (!Number.isSafeInteger(users) || users <= 0) throw new Error('잘못된 사용자 수');
      rows.push({ name: cells[1], users });
    }
    if (!REQUIRED.every(name => rows.some(row => row.name === name))) continue;
    if (new Set(rows.map(row => row.name)).size !== rows.length || rows.some((row, i) => i && row.users > rows[i - 1].users)) throw new Error('중복 또는 순서가 잘못된 OTT 표');
    const periods = [...clean(info.content.slice(0, table.index)).matchAll(/(20\d{2})\s*년\s*(\d{1,2})\s*월/g)];
    const period = periods.at(-1);
    if (!period || +period[2] < 1 || +period[2] > 12) throw new Error('조사 기준월 없음');
    const month = `${period[1]}-${period[2].padStart(2, '0')}`;
    if (month > String(info.baseDT).slice(0, 7)) throw new Error('발표일보다 미래인 조사월');
    return { month, publishedAt: info.baseDT, source: '와이즈앱·리테일', sourceUrl: `https://www.wiseapp.co.kr/insight/detail/${info.insightNid}`, sourceId: info.insightNid, rows };
  }
  throw new Error('라프텔·왓챠를 포함한 동일 기준의 OTT 표가 없습니다.');
}

async function post(endpoint, body) {
  const response = await fetch(`https://www.wiseapp.co.kr${endpoint}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`공개 자료 응답 ${response.status}`);
  const data = await response.json();
  if (data.resultCode !== 0) throw new Error('공개 자료 접근 불가');
  return data;
}

export async function updateOtt(dryRun = false) {
  const previous = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  const listing = await post('/insight/getList.json', { sortType: 'new', searchStr: 'OTT', pageInfo: { currentPage: 0, pagePerCnt: 24 }, insightTypeApp: 1, insightTypeRetail: 0, categoryType: 99, firstPage: true, appBrandRelPage: false });
  if (!Array.isArray(listing.insightList)) throw new Error('공개 목록 형식 변경');
  const candidates = listing.insightList.filter(info => info.categoryType === 1 && /OTT/i.test(info.title) && info.baseDT >= previous.publishedAt).slice(0, 5);
  let best = previous;
  for (const candidate of candidates) {
    const detail = await post('/insight/detail/getDetail.json', { insightNid: String(candidate.insightNid), preview: 0 });
    if (!detail.insightInfo) throw new Error('공개 본문 없음');
    let report;
    try { report = parseOttReport(detail.insightInfo); }
    catch { console.warn(`자료 ${candidate.insightNid}: 동일 기준 표 미확인, 기존 데이터 유지`); continue; }
    if (report.month > best.month || (report.month === best.month && report.publishedAt >= best.publishedAt)) best = report;
  }
  if (JSON.stringify(best) === JSON.stringify(previous)) { console.log(`OTT: ${previous.month} 자료 유지, 새 검증 자료 없음`); return; }
  if (!dryRun) fs.writeFileSync(FILE, JSON.stringify(best, null, 2) + '\n');
  console.log(`OTT: ${best.month}, ${best.rows.length}개 앱${dryRun ? ' (미리보기)' : ' 갱신'}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) updateOtt(process.argv.includes('--dry-run')).catch(error => { console.error(`::warning::OTT 갱신 실패, 기존 자료 유지: ${error.message}`); process.exitCode = 1; });
