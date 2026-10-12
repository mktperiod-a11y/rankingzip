import fs from 'node:fs';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
fs.mkdirSync('probe', { recursive: true });
const out = [];
for (const id of [81948520, 83193406, 81911391, 82682405]) {
  const res = await fetch(`https://www.netflix.com/title/${id}`, { headers: { 'user-agent': UA, 'accept-language': 'ko-KR,ko;q=0.9' } });
  const html = (await res.text()).replace(/\\x2F/g, '/').replace(/\\u002F/g, '/');
  const og = html.match(/property="og:image" content="([^"]+)"/)?.[1];
  out.push(`## ${id} ${res.status} len=${html.length} title=${html.match(/<title>([^<]*)/)?.[1]} og=${og}`);
  const urls = [...new Set(html.match(/https:\/\/[a-z0-9.-]*(?:nflxso|nflximg|nflxext)\.net\/[^"'\\ )]+/g) ?? [])].filter((u) => /\.(jpg|webp|png)/.test(u));
  out.push(`  urls: ${urls.length}`);
  for (const [i, u] of urls.slice(0, 14).entries()) {
    const at = html.indexOf(u);
    out.push(`  [${i}] ${u.slice(0, 150)}\n     ctx: ${html.slice(Math.max(0, at - 140), at).replace(/\s+/g, ' ')}`);
    try { const r = await fetch(u.replace(/&amp;/g, '&'), { headers: { 'user-agent': UA } }); if (r.ok) fs.writeFileSync(`probe/${id}-${i}.jpg`, Buffer.from(await r.arrayBuffer())); } catch {}
  }
}
fs.writeFileSync('probe/log.txt', out.join('\n'));
