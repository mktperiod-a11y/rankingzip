import fs from 'node:fs';
fs.mkdirSync('data/probe', { recursive: true });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const log = [];
for (const u of ['https://www.filebogo.com/', 'https://filebogo.com/', 'https://www.applefile.co.kr/', 'https://applefile.co.kr/', 'https://www.applefile.com/', 'https://www.apple-file.co.kr/']) {
  try { const r = await fetch(u, { headers: { 'user-agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(20000) }); const t = await r.text(); log.push(`${u} ${r.status} ${r.url} ${(t.match(/<title>([^<]*)/i) ?? [])[1] ?? ''} og=${(t.match(/og:image" content="([^"]+)/) ?? [])[1] ?? ''}`); }
  catch (e) { log.push(`${u} ERR ${e.message}`); }
}
for (const term of ['파일보고', '애플파일', 'filebogo', 'applefile']) {
  const r = await (await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=kr&entity=software&limit=5`)).json();
  for (const a of r.results ?? []) log.push(`itunes[${term}] ${a.trackName} | ${a.sellerName} | ${a.artworkUrl512}`);
}
fs.writeFileSync('data/probe/log.txt', log.join('\n') + '\n');
console.log(log.join('\n'));
