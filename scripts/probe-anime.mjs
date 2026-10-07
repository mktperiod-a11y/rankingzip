// 임시: AniList 역대 인기 TOP 10 확인
import fs from 'node:fs';
fs.mkdirSync('data/probe', { recursive: true });
const query = `{ Page(perPage: 10) { media(type: ANIME, sort: POPULARITY_DESC) { title { romaji english native } popularity favourites averageScore startDate { year } format coverImage { large } siteUrl } } }`;
const r = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' }, body: JSON.stringify({ query }) });
const t = await r.text();
fs.writeFileSync('data/probe/log.txt', `${r.status}\n${t}\n`);
