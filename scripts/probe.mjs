// 임시: 카넬로 사진 후보·음반 판매량 자료 확인
import fs from 'node:fs';
fs.mkdirSync('data/probe', { recursive: true });
const UA = 'RankingZipBot/1.0 (https://mktperiod-a11y.github.io/rankingzip/)';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const api = async (host, params) => { await wait(1500); const u = new URL(`https://${host}/w/api.php`); for (const [k, v] of Object.entries({ format: 'json', formatversion: '2', ...params })) u.searchParams.set(k, v); return (await fetch(u, { headers: { 'user-agent': UA } })).json(); };
const log = [];
// 1) 카넬로: 공용 분류의 파일 + 라이선스
const cat = await api('commons.wikimedia.org', { action: 'query', generator: 'categorymembers', gcmtitle: 'Category:Canelo Álvarez', gcmtype: 'file', gcmlimit: '40', prop: 'imageinfo', iiprop: 'url|extmetadata|size', iiurlwidth: '400' });
let n = 0;
for (const p of cat.query?.pages ?? []) {
  const i = p.imageinfo?.[0]; if (!i) continue;
  const lic = i.extmetadata?.LicenseShortName?.value ?? '?';
  log.push(`canelo ${n} ${p.title} ${i.width}x${i.height} ${lic} ${i.descriptionurl}`);
  if (/\.(jpe?g|png)$/i.test(p.title) && n < 24) { await wait(500); const b = Buffer.from(await (await fetch(i.thumburl, { headers: { 'user-agent': UA } })).arrayBuffer()); fs.writeFileSync(`data/probe/canelo-${String(n).padStart(2, '0')}.jpg`, b); }
  n++;
}
// 2) 음반 판매량: 위키백과 표
const html = await api('en.wikipedia.org', { action: 'parse', page: 'List of best-selling music artists', prop: 'text' });
fs.writeFileSync('data/probe/best-selling.html', html.parse?.text ?? JSON.stringify(html));
const ko = await api('ko.wikipedia.org', { action: 'parse', page: '가장 많은 음반을 판매한 음악가 목록', prop: 'text' });
fs.writeFileSync('data/probe/best-selling-ko.html', ko.parse?.text ?? JSON.stringify(ko));
fs.writeFileSync('data/probe/log.txt', log.join('\n') + '\n');
