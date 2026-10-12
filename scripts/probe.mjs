import fs from 'node:fs';
const out = [];
const weekly = JSON.parse(fs.readFileSync('data/rankings/anime-weekly.json', 'utf8'));
const ids = weekly.rows.map((r) => r.id).filter(Boolean);
const q = `query ($ids: [Int]) { Page(perPage: 50) { media(id_in: $ids) { id title { romaji english native } synonyms relations { edges { relationType node { id title { native } synonyms } } } } } }`;
const r = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ query: q, variables: { ids } }) });
const media = (await r.json()).data.Page.media;
for (const m of media) {
  out.push(`## ${m.id} ${m.title.english} | ${m.title.native}`);
  out.push(`  synonyms: ${m.synonyms.join(' | ')}`);
  for (const e of m.relations.edges.filter((e) => e.relationType === 'PREQUEL' || e.relationType === 'PARENT')) out.push(`  ${e.relationType} ${e.node.id} ${e.node.title.native} :: ${e.node.synonyms.join(' | ')}`);
  for (const kw of [m.title.native, m.title.romaji]) {
    try {
      const res = await fetch(`https://laftel.net/api/search/v3/keyword/?keyword=${encodeURIComponent(kw)}`, { headers: { 'user-agent': 'Mozilla/5.0', laftel: 'TeJava' } });
      const t = await res.text();
      out.push(`  laftel(${kw}) ${res.status}: ${t.slice(0, 400).replace(/\s+/g, ' ')}`);
    } catch (e) { out.push(`  laftel ERR ${e.message}`); }
  }
  await new Promise((s) => setTimeout(s, 700));
}
fs.mkdirSync('probe', { recursive: true });
fs.writeFileSync('probe/log.txt', out.join('\n'));
console.log(out.join('\n'));
