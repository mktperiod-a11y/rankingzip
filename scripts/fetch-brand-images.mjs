#!/usr/bin/env node
import fs from 'node:fs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const APPS = [
  ['넷플릭스', 'netflix', 'Netflix', /^netflix$/i], ['쿠팡플레이', 'coupangplay', '쿠팡플레이', /쿠팡플레이|coupang play/i], ['티빙', 'tving', 'TVING', /tving|티빙/i],
  ['웨이브', 'wavve', 'Wavve', /wavve|웨이브/i], ['디즈니+', 'disneyplus', 'Disney+', /disney\+/i], ['U+모바일tv', 'uplus-tv', 'U+tv', /u\+\s?(모바일\s?)?tv/i],
  ['라프텔', 'laftel', '라프텔', /라프텔|laftel/i], ['스포티비 나우', 'spotv-now', 'SPOTV NOW', /spotv now|스포티비 나우/i], ['왓챠', 'watcha', 'WATCHA', /watcha|왓챠/i],
  ['온디스크', 'ondisk', '온디스크', /온디스크|ondisk/i], ['예스파일', 'yesfile', '예스파일', /예스파일|yesfile/i], ['파일조', 'filejo', '파일조', /파일조|filejo/i],
  ['케이디스크', 'kdisk', '케이디스크', /케이디스크|kdisk/i], ['파일마루', 'filemaru', '파일마루', /파일마루|filemaru/i], ['빅파일', 'bigfile', '빅파일', /빅파일|bigfile/i],
  ['파일시티', 'filecity', '파일시티', /파일시티|filecity/i], ['파일보고', 'filebogo', '파일보고', /파일보고|filebogo/i], ['애플파일', 'applefile', '애플파일', /애플파일|applefile/i],
];
const PC = [
  ['FC온라인', 'fc-online', 'https://fconline.nexon.com/'], ['배틀그라운드', 'pubg', 'https://pubg.com/ko/main'],
  ['리니지 클래식', 'lineage-classic', 'https://lineageclassic.plaync.com/ko-kr'], ['오버워치', 'overwatch', 'https://overwatch.blizzard.com/ko-kr/'],
  ['Roblox', 'roblox', 'https://www.roblox.com/'], ['스타크래프트', 'starcraft', 'https://starcraft.blizzard.com/ko-kr'],
];
const ext = (type) => (/png/.test(type) ? 'png' : /webp/.test(type) ? 'webp' : 'jpg');
async function save(url, base) {
  const res = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`${res.status}`);
  const file = `${base}.${ext(res.headers.get('content-type') || '')}`;
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  return file;
}

fs.mkdirSync('public/ranking-images/apps', { recursive: true });
const apps = {};
for (const [name, key, term, must] of APPS) {
  try {
    const data = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=kr&entity=software&limit=15`).then((r) => r.json());
    const app = (data.results ?? []).find((a) => must.test(a.trackName));
    if (!app) { console.log(`✗ 앱 ${name}`); continue; }
    const file = await save(app.artworkUrl512, `public/ranking-images/apps/${key}`);
    apps[name] = { image: `/${file.replace(/^public\//, '')}`, source: app.trackViewUrl.split('?')[0], app: app.trackName };
    console.log(`✓ 앱 ${name} — ${app.trackName}`);
  } catch (e) { console.log(`✗ 앱 ${name} ${e.message}`); }
}
fs.writeFileSync('public/ranking-images/apps/sources.json', `${JSON.stringify(apps, null, 2)}\n`);

const pc = {};
for (const [name, key, url] of PC) {
  try {
    const html = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'ko-KR' }, signal: AbortSignal.timeout(30000) }).then((r) => r.text());
    const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1];
    if (!og) { console.log(`✗ PC ${name} og:image 없음`); continue; }
    const src = new URL(og.replace(/&amp;/g, '&'), url).href;
    const file = await save(src, `public/ranking-images/games/pc-art-${key}`);
    pc[name] = { image: `/${file.replace(/^public\//, '')}`, source: url };
    console.log(`✓ PC ${name} — ${src.slice(0, 90)}`);
  } catch (e) { console.log(`✗ PC ${name} ${e.message}`); }
}
fs.writeFileSync('public/ranking-images/games/pc-art.json', `${JSON.stringify(pc, null, 2)}\n`);
