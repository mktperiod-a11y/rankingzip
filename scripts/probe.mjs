import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { koreanTitle } from './update-anime.mjs';
const ids = [191656, 206401, 209872, 213805, 189123];
const out = [`tmdb key: ${process.env.TMDB_API_KEY ? 'yes' : 'no'}`];
const q = `query ($id: Int) { Media(id: $id) { id idMal format title { romaji english native } synonyms relations { edges { relationType node { id type } } } } }`;
for (const id of ids) {
  const res = await fetch('https://graphql.anilist.co', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ query: q, variables: { id } }) });
  const m = (await res.json()).data.Media;
  out.push(`${id} ${m.title.english ?? m.title.romaji} => ${await koreanTitle(m, {})}`);
  await new Promise((s) => setTimeout(s, 800));
}
try { out.push(execSync('node scripts/update-anime.mjs --dry-run 2>&1', { env: { ...process.env, ANIME_MISSING_FILE: '/tmp/miss.txt' } }).toString().slice(-1500)); } catch (e) { out.push('dry-run ERR ' + e.stdout?.toString().slice(-1500)); }
fs.mkdirSync('probe', { recursive: true });
fs.writeFileSync('probe/log.txt', out.join('\n'));
