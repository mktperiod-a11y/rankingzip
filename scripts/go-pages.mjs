import fs from 'node:fs';
import path from 'node:path';

export const goId = (url) => url.replace(/^https?:\/\/(www\.)?/, '').split(/[./]/)[0];

const attr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

export function goTargets(dataDir = 'data') {
  const read = (f) => JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
  const pool = read('webhard-pool.json');
  const links = read('rankings/webhard-links.json');
  const blocked = new Set(pool.blocked ?? []);
  const targets = new Map();
  for (const it of [...read('rankings/webhard.json').items, ...(pool.reserve ?? [])]) {
    if (blocked.has(it.name)) continue;
    targets.set(goId(it.url), links[it.name] ?? it.url);
  }
  return targets;
}

export function writeGoPages(outDir, dataDir = 'data') {
  const targets = goTargets(dataDir);
  for (const [id, to] of targets) {
    const dir = path.join(outDir, 'go', id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex, nofollow">
<meta name="referrer" content="origin">
<meta http-equiv="refresh" content="0;url=${attr(to)}">
<title>이동 중</title>
</head>
<body>
<script>location.replace(${JSON.stringify(to)})</script>
<p><a href="${attr(to)}" rel="sponsored nofollow">사이트로 이동</a></p>
</body>
</html>
`);
  }
  return targets.size;
}
