import fs from 'node:fs';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
fs.mkdirSync('probe', { recursive: true });
const html = await (await fetch('https://www.netflix.com/tudum/top10/south-korea/tv', { headers: { 'user-agent': UA, 'accept-language': 'ko-KR,ko;q=0.9' } })).text();
const cards = html.split('data-uia="top10-card"').slice(1, 11);
const out = [`cards ${cards.length}`];
fs.writeFileSync('probe/card0.html', cards[0].slice(0, 6000));
for (const [i, c] of cards.entries()) {
  const imgs = [...c.matchAll(/<img[^>]*>/g)].map((m) => m[0]);
  const bg = [...c.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1]);
  out.push(`## ${i} ${c.match(/alt="([^"]*)"/)?.[1]}`);
  for (const t of imgs) out.push(`  img ${t.slice(0, 300)}`);
  for (const b of bg) out.push(`  bg ${b.slice(0, 200)}`);
  const srcs = [...imgs.map((t) => t.match(/src="([^"]+)"/)?.[1]), ...bg].filter(Boolean);
  for (const [k, s] of srcs.entries()) { try { const r = await fetch(s.replace(/&amp;/g, '&'), { headers: { 'user-agent': UA } }); if (r.ok) fs.writeFileSync(`probe/${i}-${k}.${/png/.test(r.headers.get('content-type')) ? 'png' : /webp/.test(r.headers.get('content-type')) ? 'webp' : 'jpg'}`, Buffer.from(await r.arrayBuffer())); } catch {} }
}
fs.writeFileSync('probe/log.txt', out.join('\n'));
