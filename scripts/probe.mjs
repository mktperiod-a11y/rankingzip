import fs from 'node:fs';
import { execSync } from 'node:child_process';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const PAT = /[\w.+-]+@[\w-]+\.[\w.]+|[\w-]+\.github\.io|github\.com\/[\w-]+|[\w-]+\.workers\.dev|[\w-]+\.pages\.dev|[\w-]+\.vercel\.app|[\w-]+\.netlify\.app|[\w-]+\.firebaseapp\.com|[\w-]+\.web\.app|supabase\.co[^"' ]*|cloudflareinsights|googletagmanager\.com\/[^"' ]+|G-[A-Z0-9]{6,}|ca-pub-\d+|naver-site-verification[^>]*|google-site-verification[^>]*/g;
const out = [];
async function grab(url, name) {
  try {
    const r = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'manual' });
    const body = await r.text();
    fs.writeFileSync(`probe/${name}`, body);
    out.push(`## ${url} -> ${r.status}`);
    for (const [k, v] of r.headers) if (/server|cf-|x-github|x-vercel|x-served|via|location|x-powered|netlify|fastly/i.test(k)) out.push(`  header ${k}: ${v}`);
    const hits = [...new Set(body.match(PAT) ?? [])];
    out.push(`  hits: ${hits.join(' | ') || '-'}`);
    return body;
  } catch (e) { out.push(`## ${url} ERR ${e.message}`); return ''; }
}
fs.mkdirSync('probe', { recursive: true });
const pages = [
  ['https://www.movieseesaw.workers.dev/movie/20266281', 'seesaw.html'],
  ['https://www.movieseesaw.workers.dev/', 'seesaw-home.html'],
  ['https://www.movieseesaw.workers.dev/robots.txt', 'seesaw-robots.txt'],
  ['https://www.movieseesaw.workers.dev/sitemap.xml', 'seesaw-sitemap.xml'],
  ['https://ottbora.co.kr/index.html', 'ottbora.html'],
  ['https://ottbora.co.kr/robots.txt', 'ottbora-robots.txt'],
  ['https://ottbora.co.kr/sitemap.xml', 'ottbora-sitemap.xml'],
];
for (const [u, n] of pages) {
  const body = await grab(u, n);
  if (!n.endsWith('.html')) continue;
  const scripts = [...body.matchAll(/<script[^>]+src=["']([^"']+)/g)].map((m) => new URL(m[1], u).href).filter((s) => new URL(s).host === new URL(u).host).slice(0, 6);
  for (const [i, s] of scripts.entries()) await grab(s, `${n}.js${i}`);
}
for (const d of ['ottbora.co.kr', 'www.ottbora.co.kr', 'www.movieseesaw.workers.dev']) {
  for (const t of ['CNAME', 'A', 'NS', 'TXT']) {
    try { out.push(`dns ${d} ${t}: ${execSync(`dig +short ${t} ${d}`).toString().trim().replace(/\n/g, ' , ') || '-'}`); } catch (e) { out.push(`dns ${d} ${t} ERR`); }
  }
}
try { out.push('whois ottbora.co.kr:\n' + execSync('whois ottbora.co.kr | head -40').toString()); } catch (e) { out.push('whois ERR ' + e.message); }
fs.writeFileSync('probe/log.txt', out.join('\n'));
console.log(out.join('\n'));
