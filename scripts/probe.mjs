import fs from 'node:fs';
fs.mkdirSync('data/probe', { recursive: true });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const out = [];
for (const u of ['https://time.com/section/entertainment/', 'https://time.com/', 'https://time.com/collections/time100/']) {
  try {
    const t = await (await fetch(u, { headers: { 'user-agent': UA } })).text();
    const links = [...t.matchAll(/<a[^>]+href="(https:\/\/time\.com\/[^"]+|\/[0-9]{6,}[^"]*)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => [m[1], m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()]).filter(([, x]) => x.length > 20);
    out.push(`## ${u} ${links.length}`);
    for (const [h, x] of [...new Map(links.map((l) => [l[1], l])).values()].slice(0, 80)) out.push(`${x} | ${h}`);
  } catch (e) { out.push(`${u} ERR ${e.message}`); }
}
fs.writeFileSync('data/probe/time.txt', out.join('\n') + '\n');
