import fs from 'node:fs';
fs.mkdirSync('data/probe', { recursive: true });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const url = 'https://namu.wiki/w/%ED%95%9C%EA%B5%AD%20%EB%93%9C%EB%9D%BC%EB%A7%88/%EA%B0%81%EC%A2%85%20%EA%B8%B0%EB%A1%9D%E3%86%8D%EC%88%9C%EC%9C%84';
const log = [];
for (const [k, u] of [['namu', url], ['namu-raw', url.replace('/w/', '/raw/')]]) {
  try {
    const r = await fetch(u, { headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml', 'accept-language': 'ko-KR,ko;q=0.9' } });
    const b = Buffer.from(await r.arrayBuffer()); fs.writeFileSync(`data/probe/${k}.html`, b); log.push(`${k} ${r.status} ${b.length}`);
  } catch (e) { log.push(`${k} ERR ${e.message}`); }
}
fs.writeFileSync('data/probe/log.txt', log.join('\n') + '\n');
console.log(log.join('\n'));
