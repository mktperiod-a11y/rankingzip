import fs from 'node:fs';
fs.mkdirSync('data/probe', { recursive: true });
const UA = 'rankingzip/1.0 (https://mktperiod-a11y.github.io/rankingzip/)';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const log = [];
async function search(key, q, n = 8) {
  await wait(1500);
  const u = new URL('https://commons.wikimedia.org/w/api.php');
  for (const [k, v] of Object.entries({ action: 'query', format: 'json', formatversion: '2', generator: 'search', gsrsearch: `${q} filetype:bitmap`, gsrnamespace: '6', gsrlimit: String(n), prop: 'imageinfo', iiprop: 'url|extmetadata|size', iiurlwidth: '500' })) u.searchParams.set(k, v);
  const j = await (await fetch(u, { headers: { 'user-agent': UA } })).json();
  let i = 0;
  for (const p of j.query?.pages ?? []) {
    const info = p.imageinfo?.[0]; if (!info) continue;
    const lic = (info.extmetadata?.LicenseShortName?.value ?? '?').replace(/<[^>]+>/g, '');
    const name = `${key}-${i++}.jpg`;
    log.push(`${name} | ${p.title} | ${info.width}x${info.height} | ${lic} | ${info.descriptionurl}`);
    await wait(400);
    fs.writeFileSync(`data/probe/${name}`, Buffer.from(await (await fetch(info.thumburl, { headers: { 'user-agent': UA } })).arrayBuffer()));
  }
}
await search('owtc', 'One World Trade Center Manhattan skyline');
await search('burj', 'Burj Khalifa tower daytime');
await search('floyd', 'Pink Floyd band members');
fs.writeFileSync('data/probe/log.txt', log.join('\n') + '\n');
