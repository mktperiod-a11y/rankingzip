#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { checkPublicOutput } from './check-public-output.mjs';
import { embedPageStyles } from './inline-page-styles.mjs';

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

const roots = new Set(['assets', 'rankings', '_vinext_fonts', ...fs.readdirSync('public')]);
const escaped = [...roots].map((r) => r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
const absolute = new RegExp(`(["'\`(=])/(${escaped})(?=[/"'\`)?#]|$)`, 'g');
const homeLink = /((?:href=|\\?"href\\?":)\\?["'`])\/(\\?["'`#?])/g;
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
const styled = embedPageStyles(outDir, base);
console.log(`스타일 내장 완료: ${styled}개 HTML`);
console.log(`GitHub Pages 빌드 완료: ${path.relative(process.cwd(), outDir)}/ (기본 경로 "${base || '/'}", 경로 수정 파일 ${changed}개)`);

checkPublicOutput(outDir);
