import fs from 'node:fs';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const out = [];
async function og(url) {
  try {
    const html = await (await fetch(url, { headers: { 'user-agent': UA } })).text();
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i) || html.match(/content=["']([^"']+)["'][^>]+property=["']og:image/i);
    out.push(`${url} og:image ${m?.[1]}`);
    return m?.[1] && new URL(m[1], url).href;
  } catch (e) { out.push(`${url} ERR ${e.message}`); }
}
async function save(src, file) {
  try {
    const r = await fetch(src, { headers: { 'user-agent': UA } });
    out.push(`${src} ${r.status} ${r.headers.get('content-type')}`);
    if (!r.ok) return false;
    fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
    return true;
  } catch (e) { out.push(`${src} ERR ${e.message}`); return false; }
}
fs.mkdirSync('probe', { recursive: true });
const official = await og('https://lostark.game.onstove.com/');
if (official) await save(official, 'probe/lostark-official');
await save('https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1599340/header.jpg', 'probe/lostark-steam-header.jpg');
await save('https://cdn.cloudflare.steamstatic.com/steam/apps/1599340/header.jpg', 'probe/lostark-steam-header2.jpg');
fs.writeFileSync('probe/log.txt', out.join('\n'));
console.log(out.join('\n'));
