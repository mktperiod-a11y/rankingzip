import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function checkPublicOutput(root) {
  const { blocked } = JSON.parse(fs.readFileSync('data/webhard-pool.json', 'utf8'));
  const failures = [];
  let checked = 0;
  const walk = dir => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(file); continue; }
      if (file.endsWith('.map')) failures.push(`${file}: source map`);
      if (!/\.(html|js|css|json|rsc|txt|xml|svg)$/.test(file)) continue;
      const raw = fs.readFileSync(file, 'utf8');
      const text = raw.replace(/\\u([0-9a-f]{4})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
      checked++;
      if (blocked.some(name => text.includes(name)) || /me2disk\.com|filecast\.co\.kr|fileis\.com/i.test(text)) failures.push(`${file}: blocked service`);
      if (/sourceMappingURL\s*=/.test(text)) failures.push(`${file}: source map reference`);
      if (/\bprevRank\b|\bmaxRank\b|webhard-pool\.json/.test(text)) failures.push(`${file}: internal ranking configuration`);
      if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}/.test(text)) failures.push(`${file}: credential pattern`);
    }
  };
  walk(root);
  if (failures.length) throw new Error(failures.join('\n'));
  console.log(`공개 산출물 ${checked}개: 금지 업체·내부 순위 설정·소스맵·인증정보 패턴 검사 통과`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) checkPublicOutput(process.argv[2] ?? 'out');
