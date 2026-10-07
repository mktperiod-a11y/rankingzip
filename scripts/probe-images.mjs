// 임시: 빈 이미지 후보를 위키백과에서 찾습니다.
import fs from 'node:fs';
fs.mkdirSync('data/probe', { recursive: true });
const items = [
  ['p-jon-rahm', ['en:Jon Rahm']], ['p-benzema', ['en:Karim Benzema']], ['p-durant', ['en:Kevin Durant']],
  ['p-hamilton', ['en:Lewis Hamilton']], ['p-sim-jeongsu', ['ko:심정수', 'en:Shim Jeong-soo']], ['p-aspinall', ['en:Tom Aspinall']],
];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const log = [];
for (const [key, titles] of items) {
  let done = false;
  for (const t of titles) {
    const [lang, title] = t.split(/:(.*)/s);
    try {
      await wait(4000);
      const r = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`, { headers: { 'user-agent': 'rankingzip/1.0 (https://mktperiod-a11y.github.io/rankingzip/; image audit)' } });
      const j = await r.json();
      const img = j.originalimage?.source;
      log.push(`${key} ${t} ${r.status} ${img ?? 'no image'} ${j.content_urls?.desktop?.page ?? ''}`);
      if (img) {
        const b = Buffer.from(await (await fetch(img, { headers: { 'user-agent': 'rankingzip/1.0 (https://mktperiod-a11y.github.io/rankingzip/; image audit)' } })).arrayBuffer());
        fs.writeFileSync(`data/probe/${key}${img.match(/\.(jpe?g|png|webp|svg)/i)?.[0].toLowerCase() ?? '.jpg'}`, b);
        // 파일 설명 페이지에서 라이선스 확인
        const file = decodeURIComponent(img.split('/').pop().split('?')[0]);
        await wait(4000);
        const meta = await (await fetch(`https://${lang}.wikipedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(file)}&prop=imageinfo&iiprop=extmetadata&format=json`, { headers: { 'user-agent': 'rankingzip/1.0 (https://mktperiod-a11y.github.io/rankingzip/; image audit)' } })).json();
        const em = Object.values(meta.query?.pages ?? {})[0]?.imageinfo?.[0]?.extmetadata ?? {};
        log.push(`  license=${em.LicenseShortName?.value ?? '?'} nonfree=${em.NonFree?.value ?? ''} artist=${(em.Artist?.value ?? '').replace(/<[^>]+>/g, '').slice(0, 60)}`);
        done = true; break;
      }
    } catch (e) { log.push(`${key} ${t} ERR ${e.message}`); }
  }
  if (!done) log.push(`${key} -> 없음`);
}
fs.writeFileSync('data/probe/log.txt', log.join('\n') + '\n');
console.log(log.join('\n'));
