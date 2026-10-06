#!/usr/bin/env node
// 넷플릭스 대한민국 주간 TOP 10(영화·TV)을 넷플릭스 공개 데이터로 갱신합니다. API 키가 필요 없습니다.
//   node scripts/update-netflix.mjs            갱신해서 data/rankings/*.json에 저장
//   node scripts/update-netflix.mjs --dry-run  저장하지 않고 결과만 출력
//   node scripts/update-netflix.mjs --input 파일.tsv   내려받는 대신 로컬 파일 사용
// 새 주간이 없으면 아무것도 바꾸지 않습니다. 데이터 형식이 예상과 다르면 저장하지 않고 실패합니다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const SOURCE_URL = 'https://www.netflix.com/tudum/top10/data/all-weeks-countries.tsv';
const COUNTRY = 'KR';
const CHARTS = [
  { category: 'Films', file: 'data/rankings/netflix-korea-films-weekly.json' },
  { category: 'TV', file: 'data/rankings/ott-content-weekly.json' },
];
const REQUIRED = ['country_iso2', 'week', 'category', 'weekly_rank', 'show_title', 'season_title', 'cumulative_weeks_in_top_10'];
const DAY = 86400000;

const isoDay = (ms) => new Date(ms).toISOString().slice(0, 10);

/** 넷플릭스 주간(월~일). 데이터의 week 값이 주의 시작(월)인지 끝(일)인지 모두 처리합니다. */
export function weekRange(week) {
  const ms = Date.parse(`${week}T00:00:00Z`);
  const day = new Date(ms).getUTCDay();
  if (day === 0) return { weekStart: isoDay(ms - 6 * DAY), weekEnd: week };
  if (day === 1) return { weekStart: week, weekEnd: isoDay(ms + 6 * DAY) };
  throw new Error(`week 값 ${week}이(가) 월요일이나 일요일이 아닙니다`);
}

/** TSV 전체에서 대한민국 최신 주간의 영화·TV 차트를 뽑습니다. */
export function parseKoreaCharts(tsv) {
  const [headerLine, ...lines] = tsv.replace(/^﻿/, '').split(/\r?\n/).filter(Boolean);
  const header = headerLine.split('\t');
  const missing = REQUIRED.filter((c) => !header.includes(c));
  if (missing.length) throw new Error(`예상한 열이 없습니다: ${missing.join(', ')} (실제 열: ${header.join(', ')})`);
  const col = Object.fromEntries(header.map((name, i) => [name, i]));
  const rows = lines.map((line) => line.split('\t')).filter((cells) => cells[col.country_iso2] === COUNTRY);
  if (!rows.length) throw new Error(`${COUNTRY} 데이터가 없습니다`);
  const latest = rows.reduce((max, cells) => (cells[col.week] > max ? cells[col.week] : max), '');
  return CHARTS.map(({ category, file }) => {
    const chart = rows
      .filter((cells) => cells[col.week] === latest && cells[col.category] === category)
      .map((cells) => {
        const title = cells[col.show_title].trim();
        const seasonTitle = cells[col.season_title].trim();
        const season = !seasonTitle || seasonTitle === 'N/A' || seasonTitle === title ? '' : seasonTitle.startsWith(`${title}: `) ? seasonTitle.slice(title.length + 2) : seasonTitle;
        const weeks = Number(cells[col.cumulative_weeks_in_top_10]);
        return { rank: Number(cells[col.weekly_rank]), title, season, weeks: Number.isInteger(weeks) && weeks > 0 ? weeks : null };
      })
      .sort((a, b) => a.rank - b.rank);
    const ranks = chart.map((r) => r.rank).join(',');
    if (ranks !== '1,2,3,4,5,6,7,8,9,10') throw new Error(`${category} ${latest}: 순위가 1~10위 10개가 아닙니다 (${ranks || '없음'})`);
    if (chart.some((r) => !r.title)) throw new Error(`${category} ${latest}: 제목이 빈 항목이 있습니다`);
    return { category, file, ...weekRange(latest), rows: chart };
  });
}

const todayKst = () => isoDay(Date.now() + 9 * 3600000);

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const inputIndex = args.indexOf('--input');
  const tsv = inputIndex >= 0
    ? fs.readFileSync(args[inputIndex + 1], 'utf8')
    : await fetch(SOURCE_URL, { signal: AbortSignal.timeout(60000) }).then((res) => {
      if (!res.ok) throw new Error(`${SOURCE_URL} 응답 ${res.status}`);
      return res.text();
    });

  let changed = 0;
  for (const chart of parseKoreaCharts(tsv)) {
    const file = path.resolve(chart.file);
    const current = JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log(`\n[${chart.category}] ${chart.weekStart} ~ ${chart.weekEnd} (현재 저장: ${current.weekStart} ~ ${current.weekEnd})`);
    for (const r of chart.rows) console.log(`  ${String(r.rank).padStart(2)}. ${r.title}${r.season ? ` · ${r.season}` : ''}${r.weeks ? ` (${r.weeks}주)` : ''}`);
    if (chart.weekEnd <= current.weekEnd) { console.log('  → 새 주간이 아니어서 그대로 둡니다'); continue; }
    if (dryRun) { console.log('  → 미리보기: 저장하지 않습니다'); continue; }
    const next = { source: SOURCE_URL, weekStart: chart.weekStart, weekEnd: chart.weekEnd, checkedAt: todayKst(), rows: chart.rows };
    fs.writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);
    console.log(`  → ${chart.file} 갱신`);
    changed++;
  }
  console.log(`\n갱신한 차트: ${changed}개`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(`넷플릭스 갱신 실패: ${error.message}`); process.exit(1); });
}
