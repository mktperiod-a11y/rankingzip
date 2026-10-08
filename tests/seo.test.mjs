import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import test from 'node:test';
import assert from 'node:assert/strict';
import { writeSeoFiles } from '../scripts/seo-files.mjs';

const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'));
  const scope = { exports: {}, require: (name) => load(path.resolve(path.dirname(file), name) + (name.endsWith('.json') ? '' : '.ts')) };
  cache.set(file, scope.exports);
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, scope);
  return scope.exports;
}

test('josa picks the particle from the last syllable, digit or letter', () => {
  const { josa } = load('app/rankings/josa.ts');
  assert.equal(josa('삼성', '이/가'), '이');
  assert.equal(josa('KT', '이/가'), '가');
  assert.equal(josa('샘 힐리어드(KT)', '이/가'), '가');
  assert.equal(josa('134타점', '으로/로'), '으로');
  assert.equal(josa('서울', '으로/로'), '로');
  assert.equal(josa('0.642', '으로/로'), '로');
  assert.equal(josa('43', '으로/로'), '으로');
  assert.equal(josa('LG', '과/와'), '와');
});

test('every public ranking has a dated one-line answer', () => {
  const { pages } = load('app/rankings/data.ts');
  const { answerOf } = load('app/rankings/summary.ts');
  for (const p of pages.filter((x) => !x.noindex && (!x.unranked || x.p4p?.length))) {
    const answer = answerOf(p);
    assert.match(answer, /기준 .*1위는 .+입니다\.$/, p.slug);
  }
});

test('sitemap, robots, llms and feed come from the built pages', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-'));
  const root = 'https://example.com/site/';
  const ld = (graph) => `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script\n>`;
  fs.writeFileSync(path.join(out, 'index.html'), ld([{ '@type': 'WebSite', url: root, name: '순위ZIP' }]));
  const page = (slug, extra = '') => {
    fs.mkdirSync(path.join(out, 'rankings', slug), { recursive: true });
    fs.writeFileSync(path.join(out, 'rankings', slug, 'index.html'), extra + ld([
      { '@type': 'WebPage', url: `${root}rankings/${slug}/`, name: slug, description: `${slug} 설명`, dateModified: '2026-10-08' },
      { '@type': 'ItemList', itemListElement: [{ position: 1, name: '가', description: '10' }] },
      { '@type': 'FAQPage', mainEntity: [{ name: '질문', acceptedAnswer: { text: '답' } }] },
    ]));
  };
  page('open');
  page('hidden', '<meta name="robots" content="noindex, follow" />');
  assert.equal(writeSeoFiles(out), 1);
  const read = (f) => fs.readFileSync(path.join(out, f), 'utf8');
  assert.match(read('sitemap.xml'), /<loc>https:\/\/example\.com\/site\/rankings\/open\/<\/loc><lastmod>2026-10-08<\/lastmod>/);
  assert.doesNotMatch(read('sitemap.xml'), /hidden/);
  assert.match(read('robots.txt'), /Sitemap: https:\/\/example\.com\/site\/sitemap\.xml/);
  assert.match(read('llms.txt'), /- \[open\]\(https:\/\/example\.com\/site\/rankings\/open\/\): open 설명/);
  assert.match(read('llms-full.txt'), /1\. 가 — 10[\s\S]*Q\. 질문\nA\. 답/);
  assert.match(read('feed.xml'), /<item>[\s\S]*<link>https:\/\/example\.com\/site\/rankings\/open\/<\/link>/);
  fs.rmSync(out, { recursive: true, force: true });
});
