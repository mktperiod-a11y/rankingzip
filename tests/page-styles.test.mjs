import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { inlinePageStyles } from '../scripts/inline-page-styles.mjs';

test('cached HTML retains its styles even when the hashed CSS asset disappears', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rankingzip-styles-'));
  try {
    fs.mkdirSync(path.join(dir, 'assets'));
    const file = path.join(dir, 'assets', 'old-hash.css');
    fs.writeFileSync(file, '.logo{width:40px}.card{background:url(./photo.png)}');
    const html = inlinePageStyles('<link rel="stylesheet" href="/rankingzip/assets/old-hash.css"/>', dir, '/rankingzip');
    fs.unlinkSync(file);
    assert.match(html, /<style data-pages-css-backup=/);
    assert.match(html, /\.logo\{width:40px\}/);
    assert.match(html, /url\(\/rankingzip\/assets\/photo.png\)/);
    assert.match(html, /<link rel="stylesheet"/);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('external fonts are left untouched and missing local styles fail the build', () => {
  const external = '<link rel="stylesheet" href="https://example.org/font.css"/>';
  assert.equal(inlinePageStyles(external, '/tmp', '/rankingzip'), external);
  assert.throws(() => inlinePageStyles('<link rel="stylesheet" href="/rankingzip/assets/missing.css"/>', '/tmp', '/rankingzip'));
});
