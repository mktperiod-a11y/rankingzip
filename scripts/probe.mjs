import fs from 'node:fs';
import { wikidataImage } from './posters.mjs';
const out = [];
for (const [slug, name] of [['ufc-rankings-by-division', '톰 아스피날'], ['ufc-rankings-by-division', '브랜든 로이발'], ['ufc-rankings-by-division', '송야동'], ['ufc-rankings-by-division', '레론 머피'], ['korea-highest-mountains', '함백산'], ['korea-highest-mountains', '가리왕산'], ['kbo-single-season-home-runs', '심정수 · 2003'], ['anime-season-poll', '스틸 볼 런 죠죠의 기묘한 모험 2nd-3rd STAGE']]) {
  try { out.push(`${name} => ${JSON.stringify(await wikidataImage(slug, name))}`); } catch (e) { out.push(`${name} ERR ${e.message}`); }
}
fs.mkdirSync('probe', { recursive: true });
fs.writeFileSync('probe/log.txt', out.join('\n'));
