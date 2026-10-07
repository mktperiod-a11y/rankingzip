// 임시: 카넬로 사진 후보
import fs from 'node:fs';
fs.mkdirSync('data/probe', { recursive: true });
const UA = 'RankingZipBot/1.0 (https://mktperiod-a11y.github.io/rankingzip/)';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const api = async (params) => { await wait(1500); const u = new URL('https://commons.wikimedia.org/w/api.php'); for (const [k, v] of Object.entries({ format: 'json', formatversion: '2', ...params })) u.searchParams.set(k, v); return (await fetch(u, { headers: { 'user-agent': UA } })).json(); };
const log = [];
const res = await api({ action: 'query', generator: 'search', gsrsearch: 'Canelo Álvarez filetype:bitmap', gsrnamespace: '6', gsrlimit: '30', prop: 'imageinfo', iiprop: 'url|extmetadata|size', iiurlwidth: '400' });
let n = 0;
for (const p of res.query?.pages ?? []) {
  const i = p.imageinfo?.[0]; if (!i) continue;
  const lic = (i.extmetadata?.LicenseShortName?.value ?? '?').replace(/<[^>]+>/g, '');
  const name = `canelo-${String(n).padStart(2, '0')}.jpg`;
  log.push(`${name} ${p.title} ${i.width}x${i.height} ${lic} ${i.descriptionurl}`);
  await wait(400); fs.writeFileSync(`data/probe/${name}`, Buffer.from(await (await fetch(i.thumburl, { headers: { 'user-agent': UA } })).arrayBuffer()));
  n++;
}
fs.writeFileSync('data/probe/log.txt', log.join('\n') + '\n');
