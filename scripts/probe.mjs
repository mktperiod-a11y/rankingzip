import fs from 'node:fs';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
fs.mkdirSync('probe', { recursive: true });
const res = await fetch('https://www.netflix.com/tudum/top10/south-korea/tv', { headers: { 'user-agent': UA, 'accept-language': 'ko-KR,ko;q=0.9' } });
const html = (await res.text()).replace(/\\u002F/g, '/').replace(/\\x2F/g, '/');
fs.writeFileSync('probe/tudum.html', html);
const out = [`status ${res.status} len ${html.length}`, `top10-card: ${html.split('top10-card').length - 1}`, `title: ${html.match(/<title>([^<]*)/)?.[1]}`];
const urls = [...new Set(html.match(/https:\/\/[a-z0-9.-]*(?:nflxso|nflximg|nflxext|netflix)\.(?:net|com)\/[^"'\\ )]+\.(?:jpg|webp|png)[^"'\\ )]*/g) ?? [])];
out.push(`image urls ${urls.length}`);
for (const u of urls.slice(0, 30)) { const at = html.indexOf(u); out.push(`- ${u.slice(0, 140)}\n   ctx: ${html.slice(Math.max(0, at - 200), at).replace(/\s+/g, ' ').slice(-200)}`); }
fs.writeFileSync('probe/log.txt', out.join('\n'));
