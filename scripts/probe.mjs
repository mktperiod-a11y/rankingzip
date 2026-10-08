import fs from 'node:fs';
const UA = 'rankingzip/1.0 (https://mktperiod-a11y.github.io/rankingzip/)';
const j = await (await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/Dae_Jang_Geum', { headers: { 'user-agent': UA } })).json();
const src = j.originalimage?.source ?? j.thumbnail?.source;
if (!src) throw new Error('no image');
const r = await fetch(src, { headers: { 'user-agent': UA } });
const ext = (src.match(/\.(jpe?g|png|webp)/i)?.[1] ?? 'jpg').toLowerCase();
fs.writeFileSync(`public/ranking-images/updates/Dae_Jang_Geum.${ext}`, Buffer.from(await r.arrayBuffer()));
fs.writeFileSync('public/ranking-images/updates/dae-jang-geum.txt', `${src}\n${j.content_urls?.desktop?.page}\n`);
