#!/usr/bin/env node
// GitHub Pages용 정적 사이트 빌드: node scripts/build-github-pages.mjs [기본경로] [출력폴더]
// 예) node scripts/build-github-pages.mjs /rankingzip out
// GitHub Pages 프로젝트 사이트는 https://<계정>.github.io/<저장소>/ 아래에서 열리므로,
// 정적으로 내보낸 파일 안의 절대 경로(/assets, /rankings ...)에 기본 경로를 붙입니다.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const base = (process.argv[2] ?? process.env.PAGES_BASE_PATH ?? '').replace(/\/+$/, '');
const outDir = path.resolve(process.argv[3] ?? 'out');
if (base && !/^\/[\w.-]+(\/[\w.-]+)*$/.test(base)) throw new Error(`기본 경로 형식 오류: ${base}`);

execFileSync(process.execPath, ['node_modules/vinext/dist/cli.js', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, GITHUB_PAGES: '1' },
});

fs.rmSync(outDir, { recursive: true, force: true });
fs.cpSync('dist/client', outDir, { recursive: true });
fs.rmSync(path.join(outDir, '_headers'), { force: true });
fs.writeFileSync(path.join(outDir, '.nojekyll'), '');

// 사이트 루트 기준 경로들. public/ 최상위 항목과 빌드 산출물 폴더를 모두 포함합니다.
const roots = new Set(['assets', 'rankings', '_vinext_fonts', ...fs.readdirSync('public')]);
const escaped = [...roots].map((r) => r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
const absolute = new RegExp(`(["'\`(=])/(${escaped})(?=[/"'\`)?#]|$)`, 'g');
const homeLink = /(href=\\?["'`])\/(\\?["'`])/g;
// Vite의 동적 import 미리 불러오기 도우미: function(e){return`/`+e}
const preloadBase = /(return\s*)(["'`])\/\2\+/g;

let changed = 0;
function rewrite(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) { rewrite(file); continue; }
    if (!/\.(html|js|css|rsc|json|txt|xml)$/.test(entry.name)) continue;
    const text = fs.readFileSync(file, 'utf8');
    let next = text.replace(absolute, `$1${base}/$2`).replace(homeLink, `$1${base}/$2`);
    if (entry.name.endsWith('.js')) next = next.replace(preloadBase, `$1$2${base}/$2+`);
    if (next !== text) { fs.writeFileSync(file, next); changed++; }
  }
}
if (base) rewrite(outDir);
console.log(`GitHub Pages 빌드 완료: ${path.relative(process.cwd(), outDir)}/ (기본 경로 "${base || '/'}", 경로 수정 파일 ${changed}개)`);
