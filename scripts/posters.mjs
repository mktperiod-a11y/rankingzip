#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AUTO = 'data/rankings/auto-images.json';
const MANUAL = 'data/rankings/manual-images.json';
const MISSING = 'data/rankings/poster-missing.json';
const UA = 'RankingZipBot/1.0 (https://mktperiod-a11y.github.io/rankingzip/)';
const LOGO_SLUGS = new Set(['korea-import-car-brands', 'korea-car-sales', 'kbo-team-standings-2026', 'kbo-attendance-2026']);
const LD = /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script\s*>/g;
const MAX_BYTES = 8 * 1024 * 1024;

const readJson = (file, fallback) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : fallback);
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const norm = (s) => s.normalize('NFKC').toLowerCase().replace(/[\s·:：\-–—'’!?.,()]/g, '');

export function missingFromBuild(outDir) {
  const dir = path.join(outDir, 'rankings');
  const rows = [];
  for (const slug of fs.readdirSync(dir).sort()) {
    const file = path.join(dir, slug, 'index.html');
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    if (/<meta\s+name="robots"\s+content="noindex/.test(html)) continue;
    for (const [, body] of html.matchAll(LD)) {
      const data = JSON.parse(body);
      const graph = data['@graph'] ?? [data];
      const page = graph.find((n) => n['@type'] === 'WebPage');
      const list = graph.find((n) => n['@type'] === 'ItemList');
      for (const item of list?.itemListElement ?? []) if (!item.image) rows.push({ slug, page: page?.name ?? slug, name: item.name });
    }
  }
  return rows;
}

export function parseComment(body, names) {
  const known = new Map(names.map((n) => [norm(n), n]));
  const url = (s) => s.match(/<img[^>]+src="([^"]+)"/)?.[1] ?? s.match(/\]\((https?:\/\/[^)\s]+)\)/)?.[1] ?? s.match(/https?:\/\/[^\s)"'<>]+/)?.[0];
  const lines = body.replace(/\r/g, '').split('\n').map((l) => l.trim()).filter(Boolean);
  const found = [];
  for (let i = 0; i < lines.length; i++) {
    const at = lines[i].search(/[:：]\s*(?:!\[|<img|https?:\/\/)/);
    const label = (at >= 0 ? lines[i].slice(0, at) : lines[i]).replace(/^[-*>\s]+/, '').trim();
    const name = known.get(norm(label));
    if (!name) continue;
    const link = at >= 0 ? url(lines[i].slice(at)) : lines[i + 1] && !known.get(norm(lines[i + 1])) ? url(lines[i + 1]) : undefined;
    if (link) found.push({ name, url: link });
  }
  return found;
}

async function getJson(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json' }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function wikidataImage(slug, name) {
  const term = name.split(' · ')[0].trim();
  for (const language of ['ko', 'en']) {
    const search = await getJson(`https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&type=item&limit=7&language=${language}&uselang=${language}&search=${encodeURIComponent(term)}`);
    const ids = (search.search ?? []).map((s) => s.id);
    if (!ids.length) continue;
    const { entities } = await getJson(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=labels|aliases|claims|sitelinks&languages=ko|en&ids=${ids.join('|')}`);
    for (const id of ids) {
      const e = entities[id];
      const labels = [e.labels?.ko?.value, e.labels?.en?.value, ...(e.aliases?.ko ?? []).map((a) => a.value)].filter(Boolean).map(norm);
      if (!labels.includes(norm(term))) continue;
      const file = (p) => e.claims?.[p]?.[0]?.mainsnak?.datavalue?.value;
      const commons = LOGO_SLUGS.has(slug) ? file('P154') ?? file('P18') : file('P18') ?? file('P154');
      if (commons) return { url: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(commons)}?width=800`, source: `https://www.wikidata.org/wiki/${id}` };
      const enwiki = e.sitelinks?.enwiki?.title;
      if (enwiki) {
        const summary = await getJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(enwiki.replace(/ /g, '_'))}`).catch(() => null);
        const src = summary?.originalimage?.source ?? summary?.thumbnail?.source;
        if (src) return { url: src, source: summary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${enwiki}` };
      }
    }
  }
  return undefined;
}

async function saveImage(url, dir, key, headers = {}) {
  const res = await fetch(url, { headers: { 'user-agent': UA, ...headers }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`이미지 응답 ${res.status}`);
  if (!/^image\//.test(res.headers.get('content-type') ?? '')) throw new Error('이미지 파일이 아닙니다');
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_BYTES) throw new Error('8MB보다 큽니다');
  const { default: sharp } = await import('sharp');
  const img = sharp(buf).rotate().resize({ width: 800, height: 1200, fit: 'inside', withoutEnlargement: true });
  const { hasAlpha } = await sharp(buf).metadata();
  const ext = hasAlpha ? 'png' : 'jpg';
  const file = `public/ranking-images/${dir}/${crypto.createHash('sha1').update(key).digest('hex').slice(0, 12)}.${ext}`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await (hasAlpha ? img.png() : img.jpeg({ quality: 85 })).toFile(file);
  return `/${file.replace(/^public\//, '')}`;
}

function issueBody(missing) {
  if (!missing.length) return '';
  const lines = missing.map((m) => `- ${m.page} › **${m.name}**`);
  return [
    '자동으로 이미지를 찾지 못한 항목입니다. 댓글로 이미지를 주면 자동으로 반영됩니다(저장소 주인 댓글만).',
    '',
    '```',
    '이름: 이미지 주소',
    '이름: (이미지 파일을 끌어다 놓기)',
    '```',
    '',
    ...lines,
    '',
  ].join('\n');
}

async function auto(outDir) {
  const autoImages = readJson(AUTO, {});
  const missing = [];
  for (const row of missingFromBuild(outDir)) {
    try {
      const hit = await wikidataImage(row.slug, row.name);
      if (hit) {
        const image = await saveImage(hit.url, 'auto', `${row.slug}/${row.name}`);
        (autoImages[row.slug] ??= {})[row.name] = { image, source: hit.source };
        console.log(`자동: ${row.page} › ${row.name} ← ${hit.source}`);
        continue;
      }
    } catch (error) {
      console.log(`  ! ${row.name}: ${error.message}`);
    }
    missing.push(row);
  }
  writeJson(AUTO, autoImages);
  writeJson(MISSING, missing);
  if (process.env.POSTER_ISSUE_BODY) fs.writeFileSync(process.env.POSTER_ISSUE_BODY, issueBody(missing));
  console.log(`남은 항목 ${missing.length}개`);
}

async function comment(body) {
  const missing = readJson(MISSING, []);
  const manual = readJson(MANUAL, {});
  const result = [];
  const applied = new Set();
  for (const { name, url } of parseComment(body, [...new Set(missing.map((m) => m.name))])) {
    try {
      const host = new URL(url).hostname;
      const headers = host === 'github.com' && process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
      const image = await saveImage(url, 'manual', `${name}/${url}`, headers);
      for (const m of missing.filter((x) => x.name === name)) (manual[m.slug] ??= {})[name] = { image };
      applied.add(name);
      result.push(`- ✅ ${name}`);
    } catch (error) {
      result.push(`- ❌ ${name}: ${error.message}`);
    }
  }
  writeJson(MANUAL, manual);
  writeJson(MISSING, missing.filter((m) => !applied.has(m.name)));
  const reply = result.length ? `반영 결과\n\n${result.join('\n')}` : '목록의 이름과 이미지 주소를 찾지 못했습니다. `이름: 이미지 주소` 형식으로 적어 주세요.';
  if (process.env.POSTER_REPLY) fs.writeFileSync(process.env.POSTER_REPLY, `${reply}\n`);
  console.log(reply);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [mode, arg] = process.argv.slice(2);
  const run = mode === 'auto' ? auto(arg ?? 'out') : mode === 'comment' ? comment(process.env.COMMENT_BODY ?? '') : Promise.reject(new Error('사용법: posters.mjs auto [out] | comment'));
  run.catch((e) => { console.error(e); process.exit(1); });
}
