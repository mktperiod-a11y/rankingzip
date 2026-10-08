import fs from 'node:fs';
fs.mkdirSync('data/probe', { recursive: true });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const log = [];
for (const u of ['https://www.forbes.com/', 'https://time.com/', 'https://jmagazine.joins.com/forbes', 'https://www.nielsenkorea.co.kr/']) {
  try { const r = await fetch(u, { headers: { 'user-agent': UA } }); const t = await r.text(); log.push(`${u} ${r.status} ${(t.match(/<title>([^<]*)/i) ?? [])[1] ?? ''}`); } catch (e) { log.push(`${u} ERR ${e.message}`); }
}
const s = await (await fetch('https://ko.wikipedia.org/w/api.php?action=query&list=search&srsearch=' + encodeURIComponent('드라마 시청률 순위 역대') + '&format=json&srlimit=10', { headers: { 'user-agent': 'rankingzip/1.0' } })).json();
for (const x of s.query?.search ?? []) log.push(`wiki: ${x.title}`);
fs.writeFileSync('data/probe/log.txt', log.join('\n') + '\n');
