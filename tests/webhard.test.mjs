import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { reshuffle } from '../scripts/update-webhard.mjs';

const start = JSON.parse(fs.readFileSync('data/rankings/webhard.json', 'utf8')).items;

test('reshuffle keeps every rule over many rounds', () => {
  let items = start;
  const moves = { stay: 0, one: 0, two: 0 };
  for (let round = 0; round < 3000; round++) {
    items = reshuffle(items);
    const ranks = items.map((it) => it.rank).sort((a, b) => a - b);
    assert.deepEqual(ranks, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    for (const it of items) {
      assert.ok(Math.abs(it.rank - it.base) <= 2, `${it.name} ${it.rank} vs base ${it.base}`);
      if (it.maxRank) assert.ok(it.rank <= it.maxRank, `${it.name} below ${it.maxRank}`);
      const d = Math.abs(it.rank - it.prevRank);
      moves[d === 0 ? 'stay' : d === 1 ? 'one' : 'two'] += d <= 2 ? 1 : 0;
    }
  }
  const total = moves.stay + moves.one + moves.two;
  assert.ok(moves.stay / total > 0.5, JSON.stringify(moves));
  assert.ok(moves.two > 0 && moves.one > moves.two, JSON.stringify(moves));
});

test('ondisk never leaves the top 3', () => {
  let items = start;
  for (let round = 0; round < 3000; round++) {
    items = reshuffle(items);
    assert.ok(items.find((it) => it.name === '온디스크').rank <= 3);
  }
});

test('blocked webhards never appear and reserve fills empty slots', async () => {
  const { fill, SHOWN } = await import('../scripts/update-webhard.mjs');
  const pool = JSON.parse(fs.readFileSync('data/webhard-pool.json', 'utf8'));
  assert.equal(start.length, SHOWN);
  for (const name of pool.blocked) assert.ok(!start.some((it) => it.name === name), name);
  const next = pool.reserve[0];
  const out = fill(start.filter((it) => it.name !== start[3].name), pool);
  assert.equal(out.items.length, SHOWN);
  assert.ok(out.items.some((it) => it.name === next.name && it.prevRank === null));
  assert.ok(!out.pool.reserve.some((it) => it.name === next.name));
  const sneaky = fill([...start, { name: pool.blocked[0], url: '', base: 11, rank: 11, prevRank: 11 }], pool);
  assert.ok(sneaky.items.every((it) => !pool.blocked.includes(it.name)));
});
