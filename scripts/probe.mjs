import fs from 'node:fs';
const UA = 'RankingZipBot/1.0 (https://mktperiod-a11y.github.io/rankingzip/)';
const out = [];
for (const u of ['https://en.wikipedia.org/api/rest_v1/page/summary/Tom_Aspinall', 'https://ko.wikipedia.org/api/rest_v1/page/summary/%ED%95%A8%EB%B0%B1%EC%82%B0', 'https://en.wikipedia.org/api/rest_v1/page/summary/Hambaeksan',
  'https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages|images&piprop=original&imlimit=20&titles=Tom_Aspinall',
  'https://ko.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages|images&piprop=original&imlimit=20&titles=%ED%95%A8%EB%B0%B1%EC%82%B0',
  'https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=claims&ids=Q3727424|Q105612429']) {
  try { const r = await fetch(u, { headers: { 'user-agent': UA } }); const t = await r.text(); out.push(`## ${u}\n${r.status} ${t.slice(0, 900).replace(/\s+/g, ' ')}`); } catch (e) { out.push(`## ${u} ERR ${e.message}`); }
}
fs.mkdirSync('probe', { recursive: true });
fs.writeFileSync('probe/log.txt', out.join('\n'));
