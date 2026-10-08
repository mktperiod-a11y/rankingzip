#!/usr/bin/env node
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
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const TUDUM = { Films: 'https://www.netflix.com/tudum/top10/south-korea/films', TV: 'https://www.netflix.com/tudum/top10/south-korea/tv' };
const IMAGE_DIR = 'public/ranking-images/netflix';
const MANUAL_KO = 'data/rankings/netflix-titles-ko.json';

const isoDay = (ms) => new Date(ms).toISOString().slice(0, 10);

export function weekRange(week) {
  const ms = Date.parse(`${week}T00:00:00Z`);
  const day = new Date(ms).getUTCDay();
  if (day === 0) return { weekStart: isoDay(ms - 6 * DAY), weekEnd: week };
  if (day === 1) return { weekStart: week, weekEnd: isoDay(ms + 6 * DAY) };
  throw new Error(`week 값 ${week}이(가) 월요일이나 일요일이 아닙니다`);
}

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

const decodeHtml = (s = '') => s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim();

async function getText(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'ko-KR,ko;q=0.9' }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`${url} 응답 ${res.status}`);
  return res.text();
}

export function parseTudumCards(html) {
  return html.split('data-uia="top10-card"').slice(1).map((card) => ({
    alt: decodeHtml(card.match(/top10-card-logo[\s\S]*?alt="([^"]*)"/)?.[1]),
    videoId: card.match(/data-id="[^"]*-(\d+)"/)?.[1],
    artwork: card.match(/background-image:url\((https:[^)]+)\)/)?.[1],
  })).filter((c) => c.alt && c.videoId);
}

export function parseTitlePage(html) {
  const meta = (p) => html.match(new RegExp(`<meta[^>]+property="${p}"[^>]+content="([^"]*)"`))?.[1];
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]+>/g, '');
  const og = meta('og:title')?.replace(/^Watch\s+/, '').replace(/\s*\|\s*Netflix.*$/, '');
  return { titleKo: decodeHtml(h1 || og) || undefined, image: decodeHtml(meta('og:image')) || undefined };
}

const hasHangul = (s) => /[가-힣]/.test(s ?? '');

async function tmdbTitleKo(title, category) {
  const key = process.env.TMDB_API_KEY;
  if (!key) return undefined;
  const url = new URL(`https://api.themoviedb.org/3/search/${category === 'Films' ? 'movie' : 'tv'}`);
  url.searchParams.set('query', title);
  url.searchParams.set('language', 'ko-KR');
  const headers = { accept: 'application/json' };
  if (key.length > 40) headers.authorization = `Bearer ${key}`; else url.searchParams.set('api_key', key);
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`TMDB 응답 ${res.status}`);
  const hit = ((await res.json()).results ?? []).find((r) => hasHangul(r.title ?? r.name) && ((r.original_title ?? r.original_name) === title || r.original_language === 'ko'));
  return hit ? (hit.title ?? hit.name) : undefined;
}

async function download(src, file) {
  const res = await fetch(src, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`이미지 응답 ${res.status}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

async function enrich(chart, saveImages) {
  let cards = [];
  try { cards = parseTudumCards(await getText(TUDUM[chart.category])); } catch (error) { console.log(`  ! Tudum 페이지 실패: ${error.message}`); }
  if (saveImages) fs.mkdirSync(IMAGE_DIR, { recursive: true });
  for (const row of chart.rows) {
    const names = [row.season ? `${row.title}: ${row.season}` : '', row.title].filter(Boolean);
    const card = cards.find((c) => names.includes(c.alt)) ?? cards.find((c) => c.alt.startsWith(`${row.title}:`));
    if (!card) console.log(`  ! ${row.title}: Tudum 카드 없음`);
    else row.videoId = Number(card.videoId);
    let page = {};
    if (card) {
      try { page = parseTitlePage(await getText(`https://www.netflix.com/title/${card.videoId}`)); } catch (error) { console.log(`  ! ${row.title}: 작품 페이지 실패 (${error.message})`); }
    }
    const manual = fs.existsSync(MANUAL_KO) ? JSON.parse(fs.readFileSync(MANUAL_KO, 'utf8'))[row.title] : undefined;
    if (hasHangul(page.titleKo)) row.titleKo = page.titleKo;
    else if (manual) row.titleKo = manual;
    else {
      try { const ko = await tmdbTitleKo(row.title, chart.category); if (ko) row.titleKo = ko; } catch (error) { console.log(`  ! ${row.title}: TMDB 실패 (${error.message})`); }
    }
    const src = card?.artwork || page.image;
    if (src && saveImages) {
      const file = `${IMAGE_DIR}/${card?.videoId ?? row.title.replace(/\W+/g, '-')}.jpg`;
      try { await download(src, file); row.image = `/${file.replace(/^public\//, '')}`; } catch (error) { console.log(`  ! ${row.title}: ${error.message}`); }
    }
  }
  return chart;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const inputIndex = args.indexOf('--input');
  const online = inputIndex < 0 || args.includes('--enrich');
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
    const missingKo = chart.weekEnd === current.weekEnd && current.rows.some((r) => !r.titleKo);
    if (chart.weekEnd < current.weekEnd || (chart.weekEnd === current.weekEnd && !(missingKo && online))) { console.log('  → 새 주간이 아니어서 그대로 둡니다'); continue; }
    if (online) await enrich(chart, !dryRun);
    for (const r of chart.rows) {
      const prev = current.rows.find((p) => p.title === r.title && p.season === r.season);
      if (prev) { r.titleKo ??= prev.titleKo; r.image ??= prev.image; r.videoId ??= prev.videoId; }
    }
    for (const r of chart.rows) console.log(`  ${String(r.rank).padStart(2)}. ${r.titleKo ? `${r.titleKo} (${r.title})` : r.title}${r.season ? ` · ${r.season}` : ''}${r.weeks ? ` (${r.weeks}주)` : ''}${r.image ? ' 🖼' : ''}`);
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
