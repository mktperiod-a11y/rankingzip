import fs from 'node:fs';
import path from 'node:path';

const LD = /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script\s*>/g;
const xml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function graphOf(html) {
  return [...html.matchAll(LD)].flatMap(([, body]) => {
    const data = JSON.parse(body);
    return data['@graph'] ?? [data];
  });
}

function readPages(outDir) {
  const dir = path.join(outDir, 'rankings');
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(dir, e.name, 'index.html')))
    .flatMap((e) => {
      const html = fs.readFileSync(path.join(dir, e.name, 'index.html'), 'utf8');
      if (/<meta\s+name="robots"\s+content="noindex/.test(html)) return [];
      const graph = graphOf(html);
      const page = graph.find((n) => n['@type'] === 'WebPage');
      if (!page) return [];
      return [{
        page,
        list: graph.find((n) => n['@type'] === 'ItemList'),
        faq: graph.find((n) => n['@type'] === 'FAQPage'),
      }];
    })
    .sort((a, b) => (b.page.dateModified ?? '').localeCompare(a.page.dateModified ?? '') || a.page.name.localeCompare(b.page.name, 'ko'));
}

export function writeSeoFiles(outDir) {
  const home = graphOf(fs.readFileSync(path.join(outDir, 'index.html'), 'utf8'));
  const site = home.find((n) => n['@type'] === 'WebSite');
  if (!site) throw new Error('홈 구조화 데이터(WebSite)가 없습니다');
  const root = site.url;
  const pages = readPages(outDir);
  const latest = pages.map((p) => p.page.dateModified).filter(Boolean).sort().at(-1);
  const write = (name, text) => fs.writeFileSync(path.join(outDir, name), text);

  write('sitemap.xml', [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <url><loc>${xml(root)}</loc>${latest ? `<lastmod>${latest}</lastmod>` : ''}</url>`,
    ...pages.map(({ page }) => `  <url><loc>${xml(page.url)}</loc>${page.dateModified ? `<lastmod>${page.dateModified}</lastmod>` : ''}</url>`),
    '</urlset>',
    '',
  ].join('\n'));

  write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${root}sitemap.xml\n`);

  write('llms.txt', [
    `# ${site.name}`,
    '',
    '> 스포츠·영화·OTT·자동차·게임·세계 기록 순위를 출처와 기준일을 밝혀 정리한 한국어 순위 모음입니다.',
    '',
    `전체 내용: ${root}llms-full.txt`,
    '',
    '## 순위',
    '',
    ...pages.map(({ page }) => `- [${page.name}](${page.url}): ${page.description}`),
    '',
  ].join('\n'));

  write('llms-full.txt', [
    `# ${site.name} 전체 순위`,
    '',
    ...pages.flatMap(({ page, list, faq }) => [
      `## ${page.name}`,
      '',
      `- 주소: ${page.url}`,
      ...(page.dateModified ? [`- 업데이트: ${page.dateModified}`] : []),
      ...(page.citation || page.isBasedOn ? [`- 출처: ${[page.citation, page.isBasedOn].filter(Boolean).join(' ')}`] : []),
      '',
      page.description,
      '',
      ...(list?.itemListElement ?? []).map((r) => `${r.position}. ${r.name}${r.description ? ` — ${r.description}` : ''}`),
      '',
      ...(faq?.mainEntity ?? []).flatMap((q) => [`Q. ${q.name}`, `A. ${q.acceptedAnswer.text}`, '']),
    ]),
  ].join('\n'));

  const rfc822 = (d) => new Date(`${d}T09:00:00+09:00`).toUTCString();
  write('feed.xml', [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '<channel>',
    `  <title>${xml(site.name)}</title>`,
    `  <link>${xml(root)}</link>`,
    '  <description>순위ZIP 순위 업데이트</description>',
    '  <language>ko</language>',
    `  <atom:link href="${xml(root)}feed.xml" rel="self" type="application/rss+xml" />`,
    ...(latest ? [`  <lastBuildDate>${rfc822(latest)}</lastBuildDate>`] : []),
    ...pages.map(({ page }) => [
      '  <item>',
      `    <title>${xml(page.name)}</title>`,
      `    <link>${xml(page.url)}</link>`,
      `    <guid isPermaLink="false">${xml(page.url)}#${page.dateModified ?? ''}</guid>`,
      `    <description>${xml(page.description)}</description>`,
      ...(page.dateModified ? [`    <pubDate>${rfc822(page.dateModified)}</pubDate>`] : []),
      '  </item>',
    ].join('\n')),
    '</channel>',
    '</rss>',
    '',
  ].join('\n'));

  return pages.length;
}
