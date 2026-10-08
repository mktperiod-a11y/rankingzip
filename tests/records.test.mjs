import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGametrics, parseKobis, parseMojoWorld, parseNumbersFranchise, parseDanawa, parseKboTeams, parseKboHitters, parseUfc } from '../scripts/update-records.mjs';

const fx = (f) => fs.readFileSync(`tests/fixtures/records/${f}`, 'utf8');

test('게임트릭스 PC방 점유율', () => {
  const d = parseGametrics(fx('gametrics.html'));
  assert.equal(d.date, '2026-10-06');
  assert.deepEqual(d.rows[0], { rank: 1, name: '리그 오브 레전드', share: 34.04 });
  assert.equal(d.rows[9].name, '스타크래프트');
});

test('KOBIS 연도별·역대 박스오피스', () => {
  const y = parseKobis(fx('kobis-yearly.html'));
  assert.deepEqual(y.rows[0], { rank: 1, title: '왕과 사는 남자', movieCd: '20242837', openDt: '2026-02-04', audience: 16929365 });
  assert.equal(parseKobis(fx('kobis-former.html')).rows[0].title, '명량');
});

test('Box Office Mojo·The Numbers 흥행', () => {
  assert.deepEqual(parseMojoWorld(fx('bom-world-2026.html')).rows[1], { rank: 2, title: 'The Odyssey', gross: 1768084090 });
  const s = parseNumbersFranchise(fx('numbers-spiderman.html')).rows;
  assert.equal(s.length, 10);
  assert.ok(s.every((r) => !/Double-Bill/.test(r.title)));
  assert.equal(s.at(-1).title, 'Spider-Man: Across the Spider-Verse');
});

test('다나와 국산차 판매', () => {
  const d = parseDanawa(fx('danawa.html'), '2026-09');
  assert.equal(d.rows.length, 10);
  assert.deepEqual([d.rows[0].name, d.rows[0].brand, d.rows[0].sales], ['더 뉴 그랜저', '현대', 8898]);
});

test('KBO 팀 순위·홈런', () => {
  const t = parseKboTeams(fx('kbo-team.html')).rows;
  assert.equal(t.length, 10);
  assert.equal(t[0].team, 'KT');
  const hr = parseKboHitters(fx('kbo-hr.html'), 'hr').rows;
  assert.deepEqual(hr.slice(0, 3).map((r) => [r.rank, r.value]), [[1, 43], [2, 41], [2, 41]]);
});

test('UFC 남성부 8개 체급과 P4P', () => {
  const { p4p, divisions: d } = parseUfc(fx('ufc.html'));
  assert.deepEqual(p4p, ['Islam Makhachev', 'Alexander Volkanovski', 'Justin Gaethje', 'Petr Yan', 'Ilia Topuria']);
  assert.equal(d.length, 8);
  assert.deepEqual(d[0], { division: 'Flyweight', champion: 'Joshua Van', contenders: ['Alexandre Pantoja', 'Manel Kape', 'Brandon Royval'] });
});

test('KAIDA 수입차 브랜드 등록', async () => {
  const { parseKaida } = await import('../scripts/update-records.mjs');
  const json = JSON.parse(fx('kaida-202609.json'));
  const d = parseKaida(json, '2026-09');
  assert.equal(d.total, 34904);
  assert.deepEqual(d.rows[0], { rank: 1, brand: 'Tesla', count: 12372, share: 35.45 });
  assert.throws(() => parseKaida(json, '2026-08'));
});

test('KBO 구단 홈 관중', async () => {
  const { parseKboCrowd } = await import('../scripts/update-records.mjs');
  const d = parseKboCrowd(JSON.parse(fx('kbo-crowd.json')));
  assert.equal(d.date, '2026-10-07');
  assert.deepEqual(d.rows[0], { rank: 1, team: '삼성', crowd: 1669050 });
});

test('행정안전부 시도 인구', async () => {
  const { parseMoisCsv } = await import('../scripts/update-records.mjs');
  const d = parseMoisCsv(fx('mois.csv'));
  assert.equal(d.month, '2026-09');
  assert.equal(d.total, 51082431);
  assert.deepEqual(d.rows[0], { rank: 1, name: '경기도', population: 13777186 });
  assert.ok(d.rows.every((r) => r.name !== '전국'));
});
