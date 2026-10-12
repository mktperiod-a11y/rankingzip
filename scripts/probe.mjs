import fs from 'node:fs';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
fs.mkdirSync('probe', { recursive: true });
const d = JSON.parse(fs.readFileSync('data/rankings/ott-content-weekly.json', 'utf8'));
const out = [];
for (const r of d.rows) {
  const q = r.titleKo ?? r.title;
  try {
    const s = await (await fetch(`https://www.themoviedb.org/search/tv?query=${encodeURIComponent(q)}&language=ko-KR`, { headers: { 'user-agent': UA, 'accept-language': 'ko-KR' } })).text();
    const id = s.match(/href="\/tv\/(\d+)[^"]*"/)?.[1];
    out.push(`## ${r.rank} ${q} -> tv ${id}`);
    if (!id) continue;
    const p = await (await fetch(`https://www.themoviedb.org/tv/${id}?language=ko-KR`, { headers: { 'user-agent': UA, 'accept-language': 'ko-KR' } })).text();
    const og = p.match(/property="og:image" content="([^"]+)"/)?.[1];
    const name = p.match(/property="og:title" content="([^"]+)"/)?.[1];
    out.push(`  name ${name} og ${og}`);
    if (og) { const img = await fetch(og, { headers: { 'user-agent': UA } }); fs.writeFileSync(`probe/${r.rank}.jpg`, Buffer.from(await img.arrayBuffer())); }
  } catch (e) { out.push(`  ERR ${e.message}`); }
  await new Promise((s) => setTimeout(s, 800));
}
fs.writeFileSync('probe/log.txt', out.join('\n'));
