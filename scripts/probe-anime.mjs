// 임시: 애니 소스 구조 확인
import fs from 'node:fs';
fs.mkdirSync('data/probe', { recursive: true });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const cat = await (await fetch('https://animecorner.me/category/anime-corner/rankings/', { headers: { 'user-agent': UA } })).text();
fs.writeFileSync('data/probe/category.html', cat);
const links = [...new Set([...cat.matchAll(/href="(https:\/\/animecorner\.me\/[^"]*anime-rankings-week-\d+\/?)"/g)].map((m) => m[1]))];
console.log(links.slice(0, 5));
if (links[0]) fs.writeFileSync('data/probe/week.html', await (await fetch(links[0], { headers: { 'user-agent': UA } })).text());
try { fs.writeFileSync('data/probe/feed.xml', await (await fetch('https://animecorner.me/category/anime-corner/rankings/feed/', { headers: { 'user-agent': UA } })).text()); } catch {}
const query = `{ Page(perPage: 40) { media(type: ANIME, sort: POPULARITY_DESC) { id idMal title { romaji english native } synonyms popularity startDate { year } format coverImage { extraLarge large } siteUrl relations { edges { relationType node { id type format } } } } } }`;
const r = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ query }) });
fs.writeFileSync('data/probe/anilist.json', await r.text());
