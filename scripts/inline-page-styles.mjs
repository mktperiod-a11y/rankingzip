import fs from 'node:fs';
import path from 'node:path';

export function inlinePageStyles(html, outDir, base = '') {
  return html.replace(/<link\b[^>]*\brel="stylesheet"[^>]*>/g, tag => {
    const href = tag.match(/\bhref="([^"]+)"/)?.[1];
    if (!href?.startsWith(`${base}/assets/`) || !href.endsWith('.css')) return tag;
    const relative = href.slice(base.length + 1);
    const file = path.resolve(outDir, relative);
    if (!file.startsWith(path.resolve(outDir) + path.sep)) throw new Error(`Invalid CSS path: ${href}`);
    let css = fs.readFileSync(file, 'utf8');
    css = css.replace(/url\((['"]?)([^)'"\s]+)\1\)/g, (match, quote, url) => {
      if (/^(?:\/|#|data:|https?:)/.test(url)) return match;
      return `url(${quote}${new URL(url, `https://pages.invalid${href}`).pathname}${quote})`;
    }).replace(/<\/style/gi, '<\\/style');
    return `<style data-pages-css-backup="${href}">${css}</style>${tag}`;
  });
}

export function embedPageStyles(outDir, base = '') {
  let count = 0;
  function visit(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.name.endsWith('.html')) {
        const html = fs.readFileSync(file, 'utf8');
        const next = inlinePageStyles(html, outDir, base);
        if (html !== next) { fs.writeFileSync(file, next); count++; }
      }
    }
  }
  visit(outDir);
  return count;
}
