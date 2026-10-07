import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
import { parseKoreaCharts, parseTitlePage, parseTudumCards, weekRange } from '../scripts/update-netflix.mjs';

const fixture = fs.readFileSync('tests/fixtures/netflix-top10.tsv', 'utf8');

// app/rankings/netflix.ts를 JSON import 대신 실제 데이터 파일 내용으로 바꿔 불러옵니다.
async function loadContent() {
  const source = fs.readFileSync('app/rankings/netflix.ts', 'utf8')
    .replace(/import (\w+) from '\.\.\/\.\.\/(data\/rankings\/[\w-]+\.json)';/g, (_, name, file) => `const ${name} = ${fs.readFileSync(file, 'utf8')};`);
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  return import(`data:text/javascript,${encodeURIComponent(js)}`);
}

test('netflix weeks run Monday to Sunday whichever day the data uses', () => {
  assert.deepEqual(weekRange('2026-09-27'), { weekStart: '2026-09-21', weekEnd: '2026-09-27' });
  assert.deepEqual(weekRange('2026-09-21'), { weekStart: '2026-09-21', weekEnd: '2026-09-27' });
  assert.throws(() => weekRange('2026-09-23'));
});

test('parser takes the latest Korean week for films and TV', () => {
  const [films, tv] = parseKoreaCharts(fixture);
  assert.equal(films.weekEnd, '2026-09-27');
  assert.deepEqual(films.rows[0], { rank: 1, title: 'The Warriors', season: '', weeks: 2 });
  assert.equal(films.rows.length, 10);
  assert.deepEqual(tv.rows.slice(0, 2), [
    { rank: 1, title: 'The Scandal', season: 'Limited Series', weeks: 2 },
    { rank: 2, title: 'I am Solo', season: 'Part 34', weeks: 1 },
  ]);
});

test('parser refuses unexpected formats instead of saving bad data', () => {
  assert.throws(() => parseKoreaCharts('a\tb\n1\t2\n'), /예상한 열이 없습니다/);
  const nine = fixture.split('\n').filter((l) => !l.includes('\t2026-09-27\tFilms\t10\t')).join('\n');
  assert.throws(() => parseKoreaCharts(nine), /1~10위 10개가 아닙니다/);
});

test('updater writes only newer weeks, and dry-run writes nothing', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'netflix-'));
  fs.cpSync('data', path.join(dir, 'data'), { recursive: true });
  // 저장된 데이터는 매주 바뀌므로, 테스트용 TSV보다 이전 주간으로 고정해 둡니다.
  for (const name of ['netflix-korea-films-weekly', 'ott-content-weekly']) {
    fs.writeFileSync(path.join(dir, `data/rankings/${name}.json`), JSON.stringify({ source: '', weekStart: '2026-09-14', weekEnd: '2026-09-20', checkedAt: '2026-09-24', rows: [] }));
  }
  const run = (...args) => execFileSync(process.execPath, [path.resolve('scripts/update-netflix.mjs'), '--input', path.resolve('tests/fixtures/netflix-top10.tsv'), ...args], { cwd: dir, encoding: 'utf8' });
  const file = path.join(dir, 'data/rankings/netflix-korea-films-weekly.json');
  const before = fs.readFileSync(file, 'utf8');
  run('--dry-run');
  assert.equal(fs.readFileSync(file, 'utf8'), before);
  assert.match(run(), /갱신한 차트: 2개/);
  const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.equal(saved.weekStart, '2026-09-21');
  assert.equal(saved.rows[1].title, 'New Film');
  assert.match(run(), /갱신한 차트: 0개/);
});

test('page text is generated from the saved chart', async () => {
  const { filmsContent, tvContent, netflixFilms } = await loadContent();
  const stored = JSON.parse(fs.readFileSync('data/rankings/netflix-korea-films-weekly.json', 'utf8'));
  assert.equal(netflixFilms.rows[0].name, stored.rows[0].titleKo || stored.rows[0].title);
  assert.match(netflixFilms.date, /^\d{4}\.\d{2}\.\d{2}~/);
  const [films, tv] = parseKoreaCharts(fixture);
  const chart = (c) => ({ source: '', checkedAt: '2026-10-01', ...c });
  const f = filmsContent(chart(films));
  assert.equal(f.date, '2026.09.21~09.27 · 10월 1일 확인');
  assert.match(f.description, /1위는 The Warriors이며/);
  assert.equal(f.faq[0][1], '2026년 9월 21일부터 9월 27일까지입니다. 확인 시점에 공개된 최신 완료 주간 차트입니다.');
  const t = tvContent(chart({ ...tv, weekStart: '2026-09-28', weekEnd: '2026-10-04' }));
  assert.equal(t.date, '2026.09.28~10.04 · 10월 1일 확인');
  assert.equal(t.faq[0][1], '9월 28일부터 10월 4일까지 1위는 The Scandal: Limited Series입니다.');
});

test('Korean title and artwork are read from Netflix pages', () => {
  const tudum = '<li><div data-uia="top10-card" data-id="top10-abc-81911391" style="background-image:url(https://img.example/a.jpg?r=1);--x:1"><div data-uia="top10-card-logo"><img src="x.png" alt="The Scandal: Limited Series"/></div></div></li>'
    + '<li><div data-uia="top10-card" data-id="top10-abc-82682405" style="background-image:url(undefined)"><div data-uia="top10-card-logo"><img alt="Four Hands, Two Sonatas: Limited Series"/></div></div></li>';
  assert.deepEqual(parseTudumCards(tudum), [
    { alt: 'The Scandal: Limited Series', videoId: '81911391', artwork: 'https://img.example/a.jpg?r=1' },
    { alt: 'Four Hands, Two Sonatas: Limited Series', videoId: '82682405', artwork: undefined },
  ]);
  const page = '<meta property="og:title" content="Watch 스캔들 | Netflix Official Site"><meta property="og:image" content="https://img.example/og.jpg"><h1 class="t">스캔들</h1>';
  assert.deepEqual(parseTitlePage(page), { titleKo: '스캔들', image: 'https://img.example/og.jpg' });
  assert.equal(parseTitlePage('<meta property="og:title" content="Watch 포핸즈 | Netflix Official Site">').titleKo, '포핸즈');
});

test('Korean titles and images are used when saved', async () => {
  const { tvContent, seasonKo } = await loadContent();
  assert.equal(seasonKo('Season 2'), '시즌 2');
  assert.equal(seasonKo('Limited Series'), '리미티드 시리즈');
  const t = tvContent({ source: '', weekStart: '2026-09-28', weekEnd: '2026-10-04', checkedAt: '2026-10-07', rows: [
    { rank: 1, title: "Kian's Bizarre B&B", season: 'Season 2', weeks: 2, titleKo: '대환장 기안장', image: '/ranking-images/netflix/1.jpg' },
    { rank: 2, title: 'Marriage of Convenience', season: 'Season 1', weeks: 1 },
  ] });
  assert.deepEqual(t.rows[0], { name: '대환장 기안장', value: '1위', note: '시즌 2 · TOP 10 진입 2주', image: '/ranking-images/netflix/1.jpg' });
  assert.equal(t.rows[1].name, 'Marriage of Convenience');
  assert.equal(t.faq[0][1], '9월 28일부터 10월 4일까지 1위는 대환장 기안장 시즌 2입니다.');
});
