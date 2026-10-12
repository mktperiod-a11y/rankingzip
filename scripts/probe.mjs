import fs from 'node:fs';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
fs.mkdirSync('probe', { recursive: true });
const out = [];
for (const id of [81948520, 83193406, 81911391, 82682405]) {
  for (const path of [`kr/title/${id}`]) {
    const res = await fetch(`https://www.netflix.com/${path}`, { headers: { 'user-agent': UA, 'accept-language': 'ko-KR,ko;q=0.9' } });
    const html = await res.text();
    fs.writeFileSync(`probe/${id}.html`, html);
    const og = html.match(/property="og:image" content="([^"]+)"/)?.[1];
    out.push(`## ${id} ${res.status} og=${og}`);
    const urls = [...new Set(html.match(/https:\/\/occ-[^"'\\ ]+?\.(?:jpg|webp|png)[^"'\\ ]*/g) ?? [])];
    out.push(`  occ urls: ${urls.length}`);
    for (const [i, u] of urls.slice(0, 12).entries()) {
      const ctx = html.slice(Math.max(0, html.indexOf(u) - 160), html.indexOf(u)).replace(/\s+/g, ' ').slice(-160);
      out.push(`  [${i}] ${u.slice(0, 160)}\n     ctx: ${ctx}`);
      try { const r = await fetch(u.replace(/&amp;/g, '&'), { headers: { 'user-agent': UA } }); fs.writeFileSync(`probe/${id}-${i}.jpg`, Buffer.from(await r.arrayBuffer())); } catch {}
    }
  }
}
fs.writeFileSync('probe/log.txt', out.join('\n'));
