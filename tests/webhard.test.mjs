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
    assert.deepEqual(ranks, [1, 2, 3, 4, 5, 6, 7, 8]);
    for (const it of items) {
      assert.ok(Math.abs(it.rank - it.base) <= 2, `${it.name} ${it.rank} vs base ${it.base}`);
      if (it.maxRank) assert.ok(it.rank <= it.maxRank, `${it.name} below ${it.maxRank}`);
      const d = Math.abs(it.rank - it.prevRank);
      moves[d === 0 ? 'stay' : d === 1 ? 'one' : 'two'] += d <= 2 ? 1 : 0;
    }
  }
  const total = moves.stay + moves.one + moves.two;
  // 밀려서 함께 움직이는 경우가 있어 정확히 70%는 아니지만, 대부분은 제자리여야 합니다.
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
