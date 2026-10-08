#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = 'data/rankings/webhard.json';

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
