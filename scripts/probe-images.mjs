// 임시: 후보 이미지 수집
import fs from 'node:fs';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
fs.mkdirSync('data/probe', { recursive: true });
const save = async (url, name) => { try { const r = await fetch(url, { headers: { 'user-agent': UA } }); const b = Buffer.from(await r.arrayBuffer()); console.log(name, r.status, r.headers.get('content-type'), b.length, url); if (r.ok && /image/.test(r.headers.get('content-type') ?? '')) fs.writeFileSync(`data/probe/${name}`, b); } catch (e) { console.log(name, 'ERR', e.message); } };
await save('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvXNehH-w-MHXqQL4ayn3BEx97gWnyy3AJRUgRZ0_AM-uwhiekNmFPyl4&s=10', 'valorant.jpg');
const urls = new Set();
for (const page of ['https://maplestory.nexon.com/', 'https://maplestory.nexon.com/Home/Main', 'https://www.nexon.com/game/maplestory', 'https://maplestory.nexon.com/GameInfo/Guide']) {
  try { const h = await (await fetch(page, { headers: { 'user-agent': UA } })).text(); for (const m of h.matchAll(/(https?:)?\/\/[^"'()\s]+?\.(?:png|jpe?g|webp|svg)(?:\?[^"'()\s]*)?/gi)) urls.add(m[0].startsWith('//') ? 'https:' + m[0] : m[0]); } catch (e) { console.log(page, e.message); }
}
const list = [...urls].filter(u => /logo|key|main|visual|bi|icon|favicon|ci_/i.test(u)).slice(0, 25);
console.log(list.join('\n'));
let i = 0; for (const u of list) await save(u, `maple-${String(i++).padStart(2, '0')}${u.match(/\.(png|jpe?g|webp|svg)/i)[0]}`);
const wiki = await (await fetch('https://ko.wikipedia.org/api/rest_v1/page/summary/%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC', { headers: { 'user-agent': 'rankingzip/1.0' } })).json().catch(() => ({}));
console.log('wiki', JSON.stringify(wiki.originalimage ?? wiki.thumbnail ?? null));
if (wiki.originalimage?.source) await save(wiki.originalimage.source, 'maple-wiki' + (wiki.originalimage.source.match(/\.(png|jpe?g|webp|svg)/i)?.[0] ?? '.img'));
