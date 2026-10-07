// 임시: animecorner.me/db 접근·구조 확인
import fs from 'node:fs';
fs.mkdirSync('data/probe', { recursive: true });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const out = [];
for (const u of ['https://animecorner.me/db/', 'http://animecorner.me/db/', 'https://animecorner.me/robots.txt', 'https://animecorner.me/category/anime-corner/rankings/', 'https://laftel.net/api/home/v1/rank/', 'https://api.jikan.moe/v4/top/anime?limit=5', 'https://graphql.anilist.co']) {
  try {
    const r = await fetch(u, { headers: { 'user-agent': UA, accept: 'text/html,application/json' }, redirect: 'follow' });
    const t = await r.text();
    out.push(`## ${u} ${r.status} ${r.headers.get('content-type')} ${t.length}`);
    out.push(t.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 2500));
    const name = u.replace(/[^a-z0-9]+/gi, '_').slice(0, 60);
    fs.writeFileSync(`data/probe/${name}.txt`, t.slice(0, 400000));
  } catch (e) { out.push(`## ${u} ERR ${e.message}`); }
}
fs.writeFileSync('data/probe/log.txt', out.join('\n') + '\n');
