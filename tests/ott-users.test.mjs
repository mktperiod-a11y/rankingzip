import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseOttReport } from '../scripts/update-ott.mjs';

const current = JSON.parse(fs.readFileSync('data/rankings/ott-users.json', 'utf8'));
const report = () => ({
  categoryType: 1, insightNid: current.sourceId, baseDT: current.publishedAt,
  content: `<p>${current.month.replace('-', '년 ')}월 Android iOS 표본 조사</p><table>${current.rows.map((row, i) => `<tr><td>${i + 1}</td><td>${row.name}</td><td>${row.users / 10000}만 명</td></tr>`).join('')}</table>`,
});

test('OTT parser keeps source month and values in people', () => {
  assert.deepEqual(parseOttReport(report()), current);
});
test('OTT parser rejects missing requested apps and incompatible surveys', () => {
  const missing = report(); missing.content = missing.content.replace('라프텔', '다른 앱');
  assert.throws(() => parseOttReport(missing));
  assert.throws(() => parseOttReport({ ...report(), categoryType: 2 }));
  const devices = report(); devices.content = devices.content.replace('iOS', 'TV');
  assert.throws(() => parseOttReport(devices));
});
test('OTT parser rejects future months and duplicate app rows', () => {
  assert.throws(() => parseOttReport({ ...report(), baseDT: '2025-01-01' }));
  const duplicate = report(); duplicate.content = duplicate.content.replace('</table>', '<tr><td>10</td><td>왓챠</td><td>1만 명</td></tr></table>');
  assert.throws(() => parseOttReport(duplicate));
});
