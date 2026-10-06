import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';

const source = ts.transpileModule(fs.readFileSync('lib/trends.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { parseGoogleTrends, parseNamuwiki, mergeTrends, matchRanking, buildPicks, keywordKey, TREND_SOURCES } = await import(`data:text/javascript,${encodeURIComponent(source)}`);
const fixture = (name) => fs.readFileSync(`tests/fixtures/trends/${name}`, 'utf8');

test('sources are unique and use https endpoints', () => {
  assert.equal(new Set(TREND_SOURCES.map((s) => s.id)).size, TREND_SOURCES.length);
  for (const s of TREND_SOURCES) assert.match(s.url, /^https:\/\//);
});

test('google trends RSS: keyword, traffic, start time and related news', () => {
  const items = parseGoogleTrends(fixture('google-trends.xml'));
  assert.deepEqual(items.map((x) => [x.rank, x.keyword, x.traffic]), [[1, '삼성 라이온즈', '10000+'], [2, '오디세이 & 놀란', '2000+']]);
  assert.equal(items[0].startedAt, '2026-10-06T08:40:00.000Z');
  assert.deepEqual(items[0].news[0], { title: '삼성, KT 꺾고 "2위 탈환"', url: 'https://example.com/news/1?a=1&b=2', source: '스포츠조선' });
  assert.equal(items[0].news.length, 2);
  assert.deepEqual(items[1].news, []);
});

test('namuwiki ranking: string and object payloads, blanks dropped', () => {
  const items = parseNamuwiki(fixture('namuwiki.json'));
  assert.deepEqual(items.map((x) => x.keyword), ['삼성라이온즈', '폭군의 셰프', '오디세이(2026)', 'C++']);
  assert.deepEqual(items.map((x) => x.rank), [1, 2, 3, 4]);
  assert.deepEqual(parseNamuwiki('{"ranking":[{"keyword":"A"},{"title":"B"}]}').map((x) => x.keyword), ['A', 'B']);
  assert.throws(() => parseNamuwiki('<html>'));
});

test('merge puts keywords seen in several sources first and ignores spacing differences', () => {
  const merged = mergeTrends([
    { id: 'google', items: parseGoogleTrends(fixture('google-trends.xml')) },
    { id: 'namuwiki', items: parseNamuwiki(fixture('namuwiki.json')) },
  ]);
  assert.equal(keywordKey('삼성 라이온즈'), keywordKey('삼성라이온즈'));
  assert.equal(merged[0].keyword, '삼성 라이온즈');
  assert.deepEqual(merged[0].sources, [{ id: 'google', rank: 1 }, { id: 'namuwiki', rank: 1 }]);
  assert.equal(merged[0].traffic, '10000+');
  assert.deepEqual(merged.map((x) => x.rank), merged.map((_, i) => i + 1));
  assert.equal(merged.length, 5);
});

test('keywords link to the most relevant ranking page', () => {
  const pages = [
    { slug: 'kbo', title: '2026 KBO 팀 순위', rows: [{ name: '삼성 라이온즈' }, { name: 'KT 위즈' }] },
    { slug: 'box', title: '2026년 국내 영화 흥행 순위', rows: [{ name: '오디세이' }] },
    { slug: 'hidden', title: '오디세이 비공개', noindex: true, rows: [{ name: '오디세이' }] },
    { slug: 'nolan', title: '크리스토퍼 놀란 영화 국내 흥행 순위', rows: [{ name: '인터스텔라' }] },
  ];
  assert.equal(matchRanking('삼성라이온즈', pages)?.slug, 'kbo');
  assert.equal(matchRanking('오디세이 예매', pages)?.slug, 'box');
  assert.equal(matchRanking('크리스토퍼 놀란', pages)?.slug, 'nolan');
  assert.equal(matchRanking('kt', pages), undefined);
  assert.equal(matchRanking('날씨', pages), undefined);
});

test('editor picks are filled from trending keywords, then the editorial list', () => {
  const pages = [
    { slug: 'cars', title: '국내 자동차 월간 판매 순위', rows: [{ name: '쏘렌토', value: '9,100대' }, { name: '그랜저', value: '8,898대' }] },
    { slug: 'box', title: '2026년 국내 영화 흥행 순위', rows: [{ name: '오디세이', value: '10,027,997명', rank: 2 }] },
    { slug: 'ufc', title: 'UFC 체급별 공식 랭킹', unranked: true, rows: [{ name: '알렉스 페레이라', value: '라이트헤비급 챔피언' }] },
  ];
  const at = (minutesAgo) => new Date(Date.parse('2026-10-06T12:00:00Z') - minutesAgo * 60000).toISOString();
  const trend = (keyword, minutesAgo) => ({ keyword, startedAt: minutesAgo === undefined ? undefined : at(minutesAgo), ranking: matchRanking(keyword, pages) });
  const snapshot = { updatedAt: at(0), trends: [trend('날씨', 5), trend('그랜저', 30), trend('오디세이 2', 600), trend('오디세이', 10), trend('UFC', undefined)] };
  const fallback = [['편집 1', '순위 A', '주간', 'a'], ['편집 2', '자동차', '최종', 'cars'], ['편집 3', '순위 B', '흥행', 'b']];
  assert.deepEqual(buildPicks(snapshot, pages, fallback, 5), [
    ['그랜저 8,898대 2위', '국내 자동차 월간 판매 순위', '급상승', 'cars'],
    ['오디세이 10,027,997명 2위', '2026년 국내 영화 흥행 순위', '화제', 'box'],
    ['알렉스 페레이라 라이트헤비급 챔피언', 'UFC 체급별 공식 랭킹', '화제', 'ufc'],
    ['편집 1', '순위 A', '주간', 'a'],
    ['편집 3', '순위 B', '흥행', 'b'],
  ]);
  assert.deepEqual(buildPicks({ updatedAt: at(0), trends: [] }, pages, fallback), fallback);
});
