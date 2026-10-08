#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve(process.argv[2] ?? 'out');
const base = (process.argv[3] ?? '').replace(/\/+$/, '');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const htmlFiles = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f); else if (e.name.endsWith('.html')) htmlFiles.push(f);
  }
})(outDir);

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;/g, "'");
const external = new Map();
const internalBroken = [];
for (const file of htmlFiles) {
  const page = '/' + path.relative(outDir, file).replace(/index\.html$/, '');
  for (const [, raw] of fs.readFileSync(file, 'utf8').matchAll(/<a\b[^>]*?\shref="([^"]+)"/g)) {
    const href = decode(raw);
    if (/^https?:\/\//.test(href)) { if (!external.has(href)) external.set(href, page); continue; }
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    if (base && !(href === base || href.startsWith(`${base}/`) || href.startsWith(`${base}#`) || href.startsWith(`${base}?`))) { internalBroken.push(`${page} → ${href} (기본 경로 없음)`); continue; }
    const local = href.split(/[?#]/)[0].replace(new RegExp(`^${base}(?=/|$)`), '') || '/';
    const target = path.join(outDir, decodeURIComponent(local));
    const exists = [target, path.join(target, 'index.html'), `${target}.html`].some((t) => fs.existsSync(t) && fs.statSync(t).isFile());
    if (!exists) internalBroken.push(`${page} → ${href}`);
  }
}

async function check(url) {
  try {
    const res = await fetch(url, { redirect: 'follow', headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,*/*;q=0.8', 'accept-language': 'ko-KR,ko;q=0.9,en;q=0.8' }, signal: AbortSignal.timeout(25000) });
    const type = (res.headers.get('content-type') ?? '').split(';')[0];
    res.body?.cancel();
    if (res.status === 403 || res.status === 429) return { level: 'warn', note: `${res.status} 봇 차단 추정` };
    if (!res.ok) return { level: 'fail', note: `${res.status}` };
    if (/json|csv|tab-separated|text\/plain|xml/.test(type) && !/html/.test(type)) return { level: 'fail', note: `${res.status} 원본 데이터(${type})` };
    return { level: 'ok', note: `${res.status} ${type}${res.url !== url ? ` → ${res.url}` : ''}` };
  } catch (error) {
    return { level: 'warn', note: `연결 실패 (${error.cause?.code ?? error.name})` };
  }
}

const results = [];
const queue = [...external.keys()];
await Promise.all(Array.from({ length: 6 }, async () => {
  while (queue.length) { const url = queue.shift(); results.push({ url, page: external.get(url), ...(await check(url)) }); }
}));

const mark = { ok: '✅', warn: '⚠️', fail: '❌' };
results.sort((a, b) => ['fail', 'warn', 'ok'].indexOf(a.level) - ['fail', 'warn', 'ok'].indexOf(b.level) || a.url.localeCompare(b.url));
for (const r of results) console.log(`${mark[r.level]} ${r.note}  ${r.url}  (${r.page})`);
for (const b of internalBroken) console.log(`❌ 사이트 안 링크 없음  ${b}`);
const fails = results.filter((r) => r.level === 'fail').length + internalBroken.length;
console.log(`\n페이지 ${htmlFiles.length}개 · 바깥 링크 ${results.length}개 · 실패 ${fails} · 경고 ${results.filter((r) => r.level === 'warn').length}`);
if (fails) process.exit(1);
