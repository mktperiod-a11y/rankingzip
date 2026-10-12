import fs from 'node:fs';
const UA = 'RankingZipBot/1.0 (https://mktperiod-a11y.github.io/rankingzip/)';
const out = [];
for (const t of ['Tom Aspinall', 'Brandon Royval', 'Song Yadong', 'Lerone Murphy', 'Hambaeksan', 'Gariwangsan', '함백산', '가리왕산', 'Sim Jeong-soo']) {
  const r = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srnamespace=6&srlimit=8&srsearch=${encodeURIComponent(`intitle:"${t}"`)}`, { headers: { 'user-agent': UA } });
  const j = await r.json();
  out.push(`## ${t}: ${(j.query?.search ?? []).map((s) => s.title).join(' | ')}`);
}
fs.mkdirSync('probe', { recursive: true });
fs.writeFileSync('probe/log.txt', out.join('\n'));
