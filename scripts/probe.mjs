import fs from 'node:fs';
const UA = 'RankingZipBot/1.0 (https://mktperiod-a11y.github.io/rankingzip/)';
const out = [];
for (const [lang, term] of [['en', 'Tom Aspinall'], ['en', 'Brandon Royval'], ['ko', '함백산'], ['ko', '가리왕산'], ['en', 'Song Yadong']]) {
  const r = await fetch(`https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&type=item&limit=7&language=${lang}&uselang=${lang}&search=${encodeURIComponent(term)}`, { headers: { 'user-agent': UA } });
  const j = await r.json();
  out.push(`## ${term} ${r.status} ${JSON.stringify((j.search ?? []).map((s) => [s.id, s.label, s.description]))}`);
  const ids = (j.search ?? []).map((s) => s.id).slice(0, 3);
  if (!ids.length) continue;
  const e = await (await fetch(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=labels|claims|sitelinks&languages=ko|en&ids=${ids.join('|')}`, { headers: { 'user-agent': UA } })).json();
  for (const id of ids) { const x = e.entities[id]; out.push(`  ${id} ko=${x.labels?.ko?.value} en=${x.labels?.en?.value} P18=${x.claims?.P18?.[0]?.mainsnak?.datavalue?.value} enwiki=${x.sitelinks?.enwiki?.title} kowiki=${x.sitelinks?.kowiki?.title}`); }
}
fs.mkdirSync('probe', { recursive: true });
fs.writeFileSync('probe/log.txt', out.join('\n'));
