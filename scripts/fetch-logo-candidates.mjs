// 임시: 웹하드 공식 사이트에서 로고 후보(아이콘·대표 이미지·앱 아이콘)를 모두 내려받아 tmp-logos/에 저장합니다.
import fs from 'node:fs';
import path from 'node:path';

const services = {
  ondisk: ['https://www.ondisk.co.kr/'],
  kdisk: ['https://www.kdisk.co.kr/'],
  filestar: ['https://www.filestar.co.kr/'],
  filemaru: ['https://www.filemaru.com/'],
  yesfile: ['https://www.yesfile.com/'],
  filejo: ['https://www.filejo.com/', 'https://play.google.com/store/apps/details?id=com.contents.filejo2&hl=ko'],
  fileis: ['https://www.fileis.com/', 'https://fileis.com/', 'https://play.google.com/store/search?q=%ED%8C%8C%EC%9D%BC%EC%9D%B4%EC%A6%88&c=apps&hl=ko'],
  bigfile: ['https://www.bigfile.co.kr/', 'https://play.google.com/store/apps/details?id=kr.service.bigplay&hl=ko'],
};
const UA = { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36', 'accept-language': 'ko-KR,ko;q=0.9' };
const out = path.resolve('tmp-logos');
fs.rmSync(out, { recursive: true, force: true });
const index = {};

const attr = (tag, name) => tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i'))?.[1];
function candidates(html, base) {
  const found = [];
  for (const tag of html.match(/<link[^>]+>/gi) ?? []) {
    const rel = (attr(tag, 'rel') ?? '').toLowerCase();
    if (rel.includes('icon')) found.push({ kind: rel.replace(/\s+/g, '-'), sizes: attr(tag, 'sizes') ?? '', url: attr(tag, 'href') });
  }
  for (const tag of html.match(/<meta[^>]+>/gi) ?? []) {
    const key = (attr(tag, 'property') ?? attr(tag, 'name') ?? attr(tag, 'itemprop') ?? '').toLowerCase();
    if (['og:image', 'twitter:image', 'image'].includes(key)) found.push({ kind: key.replace(':', '-'), url: attr(tag, 'content') });
  }
  for (const tag of html.match(/<img[^>]+>/gi) ?? []) {
    const hint = `${attr(tag, 'src') ?? ''} ${attr(tag, 'alt') ?? ''} ${attr(tag, 'class') ?? ''} ${attr(tag, 'id') ?? ''}`.toLowerCase();
    if (/logo|로고|play-lh\.googleusercontent/.test(hint)) found.push({ kind: 'img-logo', alt: attr(tag, 'alt') ?? '', url: attr(tag, 'src') });
  }
  found.push({ kind: 'favicon-default', url: '/favicon.ico' });
  return found.filter((c) => c.url && !c.url.startsWith('data:')).map((c) => ({ ...c, url: new URL(c.url.replaceAll('&amp;', '&'), base).href }));
}

for (const [id, pages] of Object.entries(services)) {
  index[id] = [];
  fs.mkdirSync(path.join(out, id), { recursive: true });
  for (const page of pages) {
    let html = '';
    try {
      const res = await fetch(page, { headers: UA, redirect: 'follow', signal: AbortSignal.timeout(20000) });
      html = await res.text();
      index[id].push({ page, status: res.status, finalUrl: res.url, title: html.match(/<title[^>]*>([^<]*)/i)?.[1]?.trim() });
      if (!res.ok) continue;
    } catch (e) { index[id].push({ page, error: e.message }); continue; }
    const seen = new Set();
    let n = 0;
    for (const c of candidates(html, page)) {
      if (seen.has(c.url) || n >= 12) continue;
      seen.add(c.url);
      try {
        const res = await fetch(c.url, { headers: UA, signal: AbortSignal.timeout(20000) });
        const type = res.headers.get('content-type') ?? '';
        const buf = Buffer.from(await res.arrayBuffer());
        if (!res.ok || !/image|octet/.test(type) || buf.length < 100) { index[id].push({ ...c, skipped: `${res.status} ${type} ${buf.length}` }); continue; }
        const ext = (type.match(/image\/(png|jpeg|gif|webp|svg|x-icon|vnd\.microsoft\.icon)/)?.[1] ?? 'bin').replace('jpeg', 'jpg').replace(/x-icon|vnd\.microsoft\.icon/, 'ico').replace('svg', 'svg');
        const file = `${id}/${String(++n).padStart(2, '0')}-${c.kind}.${ext}`;
        fs.writeFileSync(path.join(out, file), buf);
        index[id].push({ ...c, file, bytes: buf.length });
      } catch (e) { index[id].push({ ...c, error: e.message }); }
    }
  }
}
fs.writeFileSync(path.join(out, 'index.json'), `${JSON.stringify(index, null, 2)}\n`);
console.log(JSON.stringify(index, null, 2));
