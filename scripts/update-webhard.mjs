#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE = 'data/rankings/webhard.json';
const POOL = 'data/webhard-pool.json';
const ICONS = 'public/ranking-images/apps/sources.json';
export const SHOWN = 10;

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

export function fill(items, pool) {
  const normalize = (name) => name.normalize('NFKC').replace(/\s+/g, '').toLowerCase();
  const blocked = new Set((pool.blocked ?? []).map(normalize));
  const allowed = (it) => !blocked.has(normalize(it.name));
  const required = new Set(pool.required ?? []);
  const unique = new Map();
  for (const it of [...items, ...(pool.reserve ?? [])].filter(allowed)) {
    if (!unique.has(it.name)) unique.set(it.name, it);
  }
  const all = [...unique.values()];
  const selected = [...all.filter(it => required.has(it.name)), ...all.filter(it => !required.has(it.name))].slice(0, SHOWN);
  const names = new Set(selected.map(it => it.name));
  const previous = new Map(items.map(it => [it.name, it]));
  selected.sort((a, b) => (a.base ?? SHOWN + 1) - (b.base ?? SHOWN + 1));
  const added = selected.filter(it => !previous.has(it.name)).map(it => ({ name: it.name, icon: it.icon }));
  const ranked = selected.map((entry, i) => {
    const it = { ...entry }; delete it.icon;
    return { ...it, base: i + 1, rank: previous.get(it.name)?.rank ?? SHOWN + 1, prevRank: previous.get(it.name)?.rank ?? null };
  }).sort((a, b) => a.rank - b.rank).map((it, i) => ({ ...it, rank: i + 1 }));
  const reserve = all.filter(it => !names.has(it.name)).map(entry => {
    const it = { ...entry }; delete it.base; delete it.rank; delete it.prevRank; return it;
  });
  return { items: ranked, pool: { ...pool, reserve }, added };
}

export function updateRanking(previous, pool, rng = Math.random) {
  const filled = fill(previous, pool);
  const ranks = new Map(previous.map(it => [it.name, it.rank]));
  const items = reshuffle(filled.items, rng).map(it => ({ ...it, prevRank: ranks.get(it.name) ?? null }));
  return { ...filled, items };
}

const todayKst = () => new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dryRun = process.argv.includes('--dry-run');
  const data = JSON.parse(fs.readFileSync(path.resolve(FILE), 'utf8'));
  const { items: nextItems, pool, added } = updateRanking(data.items, JSON.parse(fs.readFileSync(POOL, 'utf8')));
  const items = nextItems.sort((a, b) => a.rank - b.rank);
  for (const it of items) {
    const d = it.prevRank - it.rank;
    console.log(`${String(it.rank).padStart(2)}. ${it.name} ${it.prevRank == null ? 'NEW' : d > 0 ? `▲${d}` : d < 0 ? `▼${-d}` : '-'}`);
  }
  if (dryRun) process.exit(0);
  fs.writeFileSync(FILE, `${JSON.stringify({ updatedAt: todayKst(), items }, null, 2)}\n`);
  fs.writeFileSync(POOL, `${JSON.stringify(pool, null, 2)}\n`);
  if (added.some((a) => a.icon)) {
    const icons = JSON.parse(fs.readFileSync(ICONS, 'utf8'));
    for (const a of added) if (a.icon) icons[a.name] = a.icon;
    fs.writeFileSync(ICONS, `${JSON.stringify(icons, null, 2)}\n`);
  }
}
