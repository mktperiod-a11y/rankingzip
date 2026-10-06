import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import * as googleTrends from '../scripts/trends/sources/google-trends.mjs';
import * as namuwiki from '../scripts/trends/sources/namuwiki.mjs';
import { sources } from '../scripts/trends/sources/index.mjs';
import { mergeSources } from '../scripts/trends/merge.mjs';

const fixture = (name) => fs.readFileSync(`tests/fixtures/trends/${name}`, 'utf8');

test('every registered source exposes the collector contract', () => {
  assert.equal(new Set(sources.map((s) => s.id)).size, sources.length);
  for (const s of sources) {
    assert.ok(s.id && s.label && s.homepage, s.id);
    assert.equal(typeof s.parse, 'function');
    assert.equal(typeof s.collect, 'function');
  }
});

test('google trends RSS: keyword, traffic and related news', () => {
  const items = googleTrends.parse(fixture('google-trends.xml'));
  assert.deepEqual(items.map((x) => [x.rank, x.keyword, x.traffic]), [[1, '삼성 라이온즈', '10000+'], [2, '오디세이 & 놀란', '2000+']]);
  assert.equal(items[0].startedAt, '2026-10-06T08:40:00.000Z');
  assert.equal(items[0].image, 'https://encrypted-tbn1.gstatic.com/images?q=tbn:abc');
  assert.deepEqual(items[0].news[0], { title: '삼성, KT 꺾고 "2위 탈환"', url: 'https://example.com/news/1?a=1&b=2', source: '스포츠조선', image: 'https://example.com/1.jpg' });
  assert.equal(items[0].news.length, 2);
  assert.deepEqual(items[1].news, []);
});

test('namuwiki ranking: string and object payloads', () => {
  const items = namuwiki.parse(fixture('namuwiki.json'));
  assert.deepEqual(items.map((x) => x.keyword), ['삼성라이온즈', '폭군의 셰프', '오디세이(2026)', 'C++']);
  assert.deepEqual(items.map((x) => x.rank), [1, 2, 3, 4]);
  assert.equal(items[3].url, 'https://namu.wiki/w/C%2B%2B');
  assert.deepEqual(namuwiki.parse({ ranking: [{ keyword: 'A' }, { title: 'B' }] }).map((x) => x.keyword), ['A', 'B']);
});

test('merge puts keywords seen in several sources first', () => {
  const merged = mergeSources([
    { id: 'google-trends', items: googleTrends.parse(fixture('google-trends.xml')) },
    { id: 'namuwiki', items: namuwiki.parse(fixture('namuwiki.json')) },
  ]);
  assert.equal(merged[0].keyword, '삼성 라이온즈');
  assert.deepEqual(merged[0].sources.map((s) => [s.id, s.rank]), [['google-trends', 1], ['namuwiki', 1]]);
  assert.equal(merged[0].news.length, 2);
  assert.deepEqual(merged.map((x) => x.rank), merged.map((_, i) => i + 1));
  assert.equal(merged.length, 5);
});

test('CLI keeps the previous result when a source fails', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'trends-'));
  const previous = { id: 'namuwiki', label: '나무위키 실시간 검색어', collectedAt: '2026-10-01T00:00:00.000Z', items: namuwiki.parse(fixture('namuwiki.json')) };
  fs.writeFileSync(path.join(dir, 'namuwiki.json'), JSON.stringify(previous));
  let status = 0;
  try {
    execFileSync(process.execPath, ['scripts/collect-trends.mjs', 'namuwiki'], {
      env: { ...process.env, TRENDS_OUT_DIR: dir, HTTPS_PROXY: 'http://127.0.0.1:9', https_proxy: 'http://127.0.0.1:9', NODE_USE_ENV_PROXY: '1' },
      stdio: 'pipe', timeout: 30000,
    });
  } catch (error) { status = error.status; }
  // 네트워크가 막힌 환경에서는 실패(1), 열린 환경에서는 성공(0)할 수 있습니다.
  const latest = JSON.parse(fs.readFileSync(path.join(dir, 'latest.json'), 'utf8'));
  const source = latest.sources.find((s) => s.id === 'namuwiki');
  assert.ok(source);
  if (status) {
    assert.equal(source.stale, true);
    assert.equal(latest.merged[0].keyword, '삼성라이온즈');
  }
});
