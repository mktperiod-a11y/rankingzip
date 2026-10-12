import fs from 'node:fs';
import { koreanTitle, anilist } from './update-anime.mjs';
const ids = [191656, 195516, 206401, 195604, 189123, 210031, 213805, 209872, 159042, 16498, 101922];
const out = [];
for (const id of ids) {
  const { Media: m } = await anilist(`query ($id: Int) { Media(id: $id) { id idMal title { romaji english native } synonyms relations { edges { relationType node { id type } } } } }`, { id });
  out.push(`${id} ${m.title.english ?? m.title.romaji} => ${await koreanTitle(m, {})}`);
}
fs.mkdirSync('probe', { recursive: true });
fs.writeFileSync('probe/log.txt', out.join('\n'));
console.log(out.join('\n'));
