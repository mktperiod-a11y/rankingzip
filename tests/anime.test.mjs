import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { latestWeekUrl, parseWeekly, pickFranchiseLeaders } from '../scripts/update-anime.mjs';

test('Anime Corner weekly poll is parsed from the latest article', () => {
  const url = latestWeekUrl(fs.readFileSync('tests/fixtures/anime/category.html', 'utf8'));
  assert.equal(url, 'https://animecorner.me/summer-2026-anime-rankings-week-12/');
  const week = parseWeekly(fs.readFileSync('tests/fixtures/anime/week.html', 'utf8'), url);
  assert.equal(week.season, 'summer'); assert.equal(week.year, 2026); assert.equal(week.week, 12);
  assert.equal(week.publishedAt, '2026-09-25');
  assert.equal(week.rows.length, 10);
  assert.deepEqual(week.rows[0], { rank: 1, title: 'Mushoku Tensei: Jobless Reincarnation Season 3', votes: '16.97%' });
  assert.equal(week.rows[9].title, 'Clevatess Season 2');
});

test('all-time AniList ranking keeps one entry per franchise', () => {
  const media = JSON.parse(fs.readFileSync('tests/fixtures/anime/anilist-popular.json', 'utf8'));
  const names = pickFranchiseLeaders(media).map((m) => m.title.english ?? m.title.romaji);
  assert.deepEqual(names, ['Attack on Titan', 'Demon Slayer: Kimetsu no Yaiba', 'JUJUTSU KAISEN', 'Death Note', 'My Hero Academia', 'Hunter x Hunter (2011)', 'One-Punch Man', 'ONE PIECE', 'Tokyo Ghoul', 'Fullmetal Alchemist: Brotherhood']);
});

test('every listed anime has a Korean title', () => {
  const ko = JSON.parse(fs.readFileSync('data/rankings/anime-titles-ko.json', 'utf8'));
  for (const file of ['data/rankings/anime-all-time.json', 'data/rankings/anime-weekly.json']) {
    for (const r of JSON.parse(fs.readFileSync(file, 'utf8')).rows) assert.ok(r.titleKo || ko[r.id] || ko[r.title], `${file}: ${r.title} 한국어 제목 없음`);
  }
});
