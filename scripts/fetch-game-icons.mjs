#!/usr/bin/env node
// 모바일 게임 순위의 게임 아이콘을 애플 앱스토어(한국) 공식 앱 아이콘으로 받습니다. 웹하드 로고처럼 서비스 식별용입니다.
//   node scripts/fetch-game-icons.mjs → public/ranking-images/games/*.png, sources.json
import fs from 'node:fs';

const OUT = 'public/ranking-images/games';
// [화면 이름, 앱스토어 검색어, 앱 이름에 꼭 들어가야 하는 말]
const GAMES = [
  ['Roblox', 'Roblox', /roblox/i], ['블록 블라스트', 'Block Blast', /block blast|블록 블라스트/i], ['Pokemon GO', 'Pokemon GO', /pok[eé]mon go/i],
  ['브롤스타즈', 'Brawl Stars', /brawl stars|브롤스타즈/i], ['로얄 매치', 'Royal Match', /royal match|로얄 매치/i], ['Minecraft', 'Minecraft', /^minecraft/i],
  ['전략적 팀 전투', 'TFT Teamfight Tactics', /tft|전략적 팀 전투/i], ['좀비고등학교', '좀비고등학교', /좀비고/], ['피망 뉴맞고', '피망 뉴맞고', /뉴맞고/], ['쿠키런 키우기', '쿠키런 키우기', /쿠키런/],
];
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-|-$/g, '');

fs.mkdirSync(OUT, { recursive: true });
const sources = {};
for (const [name, term, must] of GAMES) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=kr&entity=software&limit=10`;
  const data = await fetch(url).then((r) => r.json());
  const app = (data.results ?? []).find((a) => must.test(a.trackName) && (a.genres ?? []).some((g) => /게임|Games/i.test(g)));
  if (!app) { console.log(`✗ ${name}`); continue; }
  const file = `${OUT}/${slug(name)}.png`;
  const res = await fetch(app.artworkUrl512);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  sources[name] = { image: `/${file.replace(/^public\//, '')}`, source: app.trackViewUrl.split('?')[0], app: app.trackName };
  console.log(`✓ ${name} — ${app.trackName}`);
}
fs.writeFileSync(`${OUT}/sources.json`, `${JSON.stringify(sources, null, 2)}\n`);
