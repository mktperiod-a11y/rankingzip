// 임시: 남은 이미지(U+모바일tv·서든어택·웹하드 앱 아이콘/대표 이미지) 수집
import fs from 'node:fs';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const ext = (t) => (/png/.test(t) ? 'png' : /webp/.test(t) ? 'webp' : /svg/.test(t) ? 'svg' : /icon|ico/.test(t) ? 'ico' : 'jpg');
async function save(url, base) { const r = await fetch(url, { headers: { 'user-agent': UA } }); if (!r.ok) throw new Error(r.status); const f = `${base}.${ext(r.headers.get('content-type') || '')}`; fs.writeFileSync(f, Buffer.from(await r.arrayBuffer())); return f; }
const out = {};
// 1) 앱스토어(한국)
for (const [name, terms, must] of [['U+모바일tv', ['U+tv', 'U+모바일tv', 'LG U+ tv'], /u\+\s?(모바일\s?)?tv/i], ['온디스크', ['온디스크'], /온디스크|ondisk/i], ['예스파일', ['예스파일'], /예스파일|yesfile/i], ['파일조', ['파일조'], /파일조|filejo/i], ['케이디스크', ['케이디스크'], /케이디스크|kdisk/i], ['파일이즈', ['파일이즈'], /파일이즈|fileis/i], ['파일스타', ['파일스타'], /파일스타|filestar/i], ['파일마루', ['파일마루'], /파일마루|filemaru/i], ['빅파일', ['빅파일'], /빅파일|bigfile/i], ['파일몽', ['파일몽'], /파일몽|filemong/i], ['파일시티', ['파일시티'], /파일시티|filecity/i]]) {
  let hit;
  for (const t of terms) { const d = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(t)}&country=kr&entity=software&limit=15`).then((r) => r.json()); hit = (d.results ?? []).find((a) => must.test(a.trackName)); if (hit) break; }
  if (hit) { const f = await save(hit.artworkUrl512, `public/ranking-images/apps/appstore-${encodeURIComponent(name).replace(/%/g, '').toLowerCase()}`); out[name] = { kind: 'appstore', image: '/' + f.replace(/^public\//, ''), source: hit.trackViewUrl.split('?')[0], app: hit.trackName }; console.log('✓ 앱스토어', name, hit.trackName); }
  else console.log('✗ 앱스토어', name);
}
// 2) 웹하드·서든어택 사이트의 대표 이미지(og:image)와 큰 아이콘(apple-touch-icon)
for (const [name, url] of [['서든어택', 'https://sa.nexon.com/main/index.aspx'], ['서든어택2', 'https://www.nexon.com/ko-KR/game/suddenattack'], ['파일몽', 'https://www.filemong.com/'], ['파일시티', 'https://www.filecity.co.kr/'], ['온디스크', 'https://www.ondisk.co.kr/'], ['예스파일', 'https://www.yesfile.com/'], ['파일조', 'https://www.filejo.com/'], ['케이디스크', 'https://www.kdisk.co.kr/'], ['파일이즈', 'https://www.fileis.com/'], ['파일스타', 'https://www.filestar.co.kr/'], ['파일마루', 'https://www.filemaru.com/'], ['빅파일', 'https://www.bigfile.co.kr/']]) {
  try {
    const html = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'ko-KR' }, signal: AbortSignal.timeout(20000) }).then((r) => r.text());
    const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1];
    const touch = html.match(/<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/i)?.[1] ?? html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*apple-touch-icon/i)?.[1];
    const res = {};
    if (og) { try { res.og = '/' + (await save(new URL(og, url).href, `public/ranking-images/apps/og-${encodeURIComponent(name).replace(/%/g, '').toLowerCase()}`)).replace(/^public\//, ''); res.ogSrc = new URL(og, url).href; } catch (e) { res.ogErr = e.message; } }
    if (touch) { try { res.touch = '/' + (await save(new URL(touch, url).href, `public/ranking-images/apps/touch-${encodeURIComponent(name).replace(/%/g, '').toLowerCase()}`)).replace(/^public\//, ''); res.touchSrc = new URL(touch, url).href; } catch (e) { res.touchErr = e.message; } }
    out[`site:${name}`] = { url, ...res }; console.log('site', name, JSON.stringify(res));
  } catch (e) { console.log('✗ site', name, e.message); }
}
fs.writeFileSync('public/ranking-images/apps/extra.json', JSON.stringify(out, null, 2) + '\n');
