import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { missingFromBuild, parseComment } from '../scripts/posters.mjs';

test('issue comments map names to image links in the formats people actually type', () => {
  const names = ['함백산', '폴스타', '스틸 볼 런 죠죠의 기묘한 모험 2nd-3rd STAGE'];
  const body = [
    '함백산: https://example.com/a.jpg',
    '- 폴스타 : ![image](https://github.com/user-attachments/assets/abc)',
    '스틸 볼 런 죠죠의 기묘한 모험 2nd-3rd STAGE',
    '<img width="300" alt="x" src="https://github.com/user-attachments/assets/def" />',
    '없는작품: https://example.com/x.jpg',
  ].join('\n');
  assert.deepEqual(parseComment(body, names), [
    { name: '함백산', url: 'https://example.com/a.jpg' },
    { name: '폴스타', url: 'https://github.com/user-attachments/assets/abc' },
    { name: '스틸 볼 런 죠죠의 기묘한 모험 2nd-3rd STAGE', url: 'https://github.com/user-attachments/assets/def' },
  ]);
  assert.deepEqual(parseComment('그냥 인사', names), []);
});

test('missing images are the list items without an image in public pages', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'posters-'));
  const page = (slug, items, extra = '') => {
    fs.mkdirSync(path.join(out, 'rankings', slug), { recursive: true });
    const graph = [{ '@type': 'WebPage', name: `${slug} 제목` }, { '@type': 'ItemList', itemListElement: items }];
    fs.writeFileSync(path.join(out, 'rankings', slug, 'index.html'), `${extra}<script type="application/ld+json">${JSON.stringify({ '@graph': graph })}</script\n>`);
  };
  page('a', [{ name: '있음', image: 'https://x/y.jpg' }, { name: '없음' }], '<span class="dp-initial" data-missing-image="송야동">송</span><span data-missing-image="없음">없</span>');
  page('b', [{ name: '숨김' }], '<meta name="robots" content="noindex, follow" />');
  assert.deepEqual(missingFromBuild(out), [{ slug: 'a', page: 'a 제목', name: '없음' }, { slug: 'a', page: 'a 제목', name: '송야동' }]);
  fs.rmSync(out, { recursive: true, force: true });
});
