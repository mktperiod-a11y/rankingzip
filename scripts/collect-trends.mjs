#!/usr/bin/env node
// 실시간 검색어 수집: node scripts/collect-trends.mjs [소스id ...]
// 결과는 data/trends/<소스id>.json 과 data/trends/latest.json(통합본)에 저장됩니다.
// 어떤 소스가 실패하면 그 소스의 직전 결과를 유지하고 나머지는 계속 진행합니다.
import fs from 'node:fs/promises';
import path from 'node:path';
import { sources } from './trends/sources/index.mjs';
import { mergeSources } from './trends/merge.mjs';

const outDir = path.resolve(process.env.TRENDS_OUT_DIR ?? 'data/trends');
const wanted = process.argv.slice(2);
const unknown = wanted.filter((id) => !sources.some((s) => s.id === id));
if (unknown.length) {
  console.error(`알 수 없는 소스: ${unknown.join(', ')} (가능: ${sources.map((s) => s.id).join(', ')})`);
  process.exit(2);
}

async function readJson(file) {
  try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return null; }
}

await fs.mkdir(outDir, { recursive: true });
const collectedAt = new Date().toISOString();
const results = [];
let failures = 0;

for (const source of sources) {
  const file = path.join(outDir, `${source.id}.json`);
  if (wanted.length && !wanted.includes(source.id)) {
    const previous = await readJson(file);
    if (previous) results.push(previous);
    continue;
  }
  try {
    const items = await source.collect();
    if (!items.length) throw new Error('수집된 항목이 0개입니다');
    const result = { id: source.id, label: source.label, homepage: source.homepage, collectedAt, items };
    await fs.writeFile(file, `${JSON.stringify(result, null, 2)}\n`);
    results.push(result);
    console.log(`✓ ${source.label}: ${items.length}개 — ${items.slice(0, 5).map((x) => x.keyword).join(', ')}`);
  } catch (error) {
    failures++;
    const previous = await readJson(file);
    if (previous) results.push({ ...previous, stale: true, error: String(error.message ?? error) });
    console.error(`✗ ${source.label}: ${error.message ?? error}${previous ? ' (직전 결과 유지)' : ''}`);
  }
}

const latest = {
  collectedAt,
  sources: results.map(({ items, ...meta }) => ({ ...meta, count: items.length })),
  merged: mergeSources(results),
};
await fs.writeFile(path.join(outDir, 'latest.json'), `${JSON.stringify(latest, null, 2)}\n`);
console.log(`→ ${path.relative(process.cwd(), outDir)}/latest.json (통합 ${latest.merged.length}개)`);
if (failures === sources.length || (wanted.length && failures === wanted.length)) process.exit(1);
