import fs from 'node:fs';
const UA = 'RankingZipBot/1.0 (https://mktperiod-a11y.github.io/rankingzip/)';
fs.mkdirSync('probe', { recursive: true });
const out = [];
for (const t of ['Baseball_at_the_Asian_Games', 'Baseball_at_the_2026_Asian_Games', 'Baseball_at_the_2022_Asian_Games']) {
  const r = await fetch(`https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=wikitext&page=${t}`, { headers: { 'user-agent': UA } });
  const j = await r.json();
  const w = j.parse?.wikitext?.['*'] ?? `ERR ${JSON.stringify(j).slice(0, 200)}`;
  fs.writeFileSync(`probe/${t}.txt`, w);
  out.push(`${t}: ${w.length}`);
}
fs.writeFileSync('probe/log.txt', out.join('\n'));
