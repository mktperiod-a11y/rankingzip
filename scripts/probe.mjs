import fs from 'node:fs';
const UA = 'rankingzip/1.0 (https://mktperiod-a11y.github.io/rankingzip/)';
const log = [];
for (const [key, title, lang] of [['pegasus-3', 'Pegasus_3_(film)', 'en'], ['pegasus-3-zh', encodeURIComponent('飞驰人生3'), 'zh'], ['pegasus-3-ko', encodeURIComponent('페가수스 3'), 'ko']]) {
  const j = await (await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${title}`, { headers: { 'user-agent': UA } })).json();
  log.push(`${key} ${j.title} | ${j.description ?? ''}`);
  const src = j.originalimage?.source;
  if (!src) { log.push(`${key} no image`); continue; }
  const ext = (src.match(/\.(jpe?g|png|webp)/i)?.[1] ?? 'jpg').toLowerCase().replace('jpeg', 'jpg');
  fs.writeFileSync(`public/ranking-images/updates/poster-${key}.${ext}`, Buffer.from(await (await fetch(src, { headers: { 'user-agent': UA } })).arrayBuffer()));
  log.push(`${key} ${j.originalimage.width}x${j.originalimage.height} ${ext} ${j.content_urls.desktop.page}`);
}
fs.writeFileSync('public/ranking-images/updates/posters2.txt', log.join('\n') + '\n');
