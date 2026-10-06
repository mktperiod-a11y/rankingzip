#!/usr/bin/env node
// 인기 웹하드 순위 갱신 (2일마다 실행): node scripts/update-webhard.mjs [--dry-run]
// 규칙: 각 항목은 약 70% 확률로 제자리, 약 30% 확률로 위·아래(반반)로 이동하고, 이동하면 대부분 1칸, 일부는 2칸입니다.
// 기본 위치(base)에서 ±2칸을 넘지 않고, maxRank가 있는 항목(온디스크: 3)은 그 순위 안에 둡니다.
// 순위표는 1~8위를 하나씩 나눠 가져야 해서 규칙을 어기는 조합을 다시 뽑는데, 이 때문에 실제 이동이 줄어듭니다.
// pTwo=0.9는 그만큼을 보정한 값으로, 실측(3만 회)에서 제자리 약 71%, 이동 중 1칸 약 84%가 나옵니다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = 'data/rankings/webhard.json';

/** 규칙에 맞는 새 순서를 만들어 rank/prevRank를 갱신합니다. 50번 안에 규칙을 지키는 순서를 못 찾으면 그대로 둡니다. */
export function reshuffle(items, rng = Math.random, pMove = 0.3, pTwo = 0.9) {
  const n = items.length;
  const fits = (it, rank) => Math.abs(rank - it.base) <= 2 && (!it.maxRank || rank <= it.maxRank);
  for (let attempt = 0; attempt < 50; attempt++) {
    const moved = items.map((it) => {
      let target = it.rank;
      if (rng() < pMove) target += (rng() < 0.5 ? -1 : 1) * (rng() < 1 - pTwo ? 1 : 2);
      target = Math.min(Math.max(target, 1, it.base - 2), n, it.base + 2, it.maxRank ?? n);
      return { it, target };
    });
    // 같은 자리를 노리면 기본 위치가 더 높은 항목이 앞에 섭니다.
    moved.sort((a, b) => a.target - b.target || a.it.base - b.it.base);
    if (moved.every(({ it }, i) => fits(it, i + 1))) {
      return moved.map(({ it }, i) => ({ ...it, prevRank: it.rank, rank: i + 1 }));
    }
  }
  return items.map((it) => ({ ...it, prevRank: it.rank }));
}

const todayKst = () => new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = path.resolve(FILE);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const items = reshuffle([...data.items].sort((a, b) => a.rank - b.rank)).sort((a, b) => a.rank - b.rank);
  for (const it of items) {
    const d = it.prevRank - it.rank;
    console.log(`${String(it.rank).padStart(2)}. ${it.name} ${d > 0 ? `▲${d}` : d < 0 ? `▼${-d}` : '-'}`);
  }
  if (!process.argv.includes('--dry-run')) fs.writeFileSync(file, `${JSON.stringify({ updatedAt: todayKst(), items }, null, 2)}\n`);
}
