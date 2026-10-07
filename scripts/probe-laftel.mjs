// 임시: 라프텔 순위 페이지·API 구조 확인
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const r = await fetch('https://laftel.net/rank', { headers: { 'user-agent': UA, 'accept-language': 'ko-KR' } });
const html = await r.text();
console.log('RANK', r.status, html.length, 'next_data', html.includes('__NEXT_DATA__'));
console.log('api urls:', [...new Set(html.match(/https?:\/\/[a-z.]*laftel[a-z.]*\/[^"'\s)]{0,80}/g) || [])].slice(0, 30).join('\n'));
const nd = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)?.[1];
if (nd) console.log('NEXT_DATA head:', nd.slice(0, 3000));
const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
console.log('scripts:', scripts.slice(0, 20).join('\n'));
for (const s of scripts.filter((s) => /rank|pages|_app|main/.test(s)).slice(0, 6)) {
  const u = new URL(s, 'https://laftel.net').href; const js = await (await fetch(u)).text();
  const apis = [...new Set(js.match(/["'`](\/api\/[^"'`]{3,80}|https:\/\/api\.laftel\.net[^"'`]{0,80})["'`]/g) || [])];
  console.log('JS', u, apis.slice(0, 40).join(' '));
}
for (const u of ['https://api.laftel.net/api/home/v1/recommend/ranking/?type=all&ranking_type=all', 'https://api.laftel.net/api/home/v1/ranking/', 'https://api.laftel.net/api/v1.0/ranking/']) {
  const res = await fetch(u, { headers: { 'user-agent': UA, laftel: 'TeJava' } }).catch((e) => ({ status: e.message, text: async () => '' }));
  console.log('TRY', u, res.status, (await res.text()).slice(0, 400));
}
