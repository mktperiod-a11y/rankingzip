// 임시: 게임 사용자 수 자료 확인용
const urls = process.argv.slice(2);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
for (const url of urls) {
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'ko-KR,ko;q=0.9' }, signal: AbortSignal.timeout(30000) });
    const html = await res.text();
    const text = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, '\n').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').split('\n').map((s) => s.trim()).filter(Boolean).join(' | ');
    console.log(`\n===== ${url} ${res.status} ${text.length}`);
    const i = Math.max(0, text.search(/MAU|사용자 수|점유율|1위/));
    console.log(text.slice(Math.max(0, i - 300), i + 3500));
  } catch (e) { console.log(url, 'ERR', e.message); }
}
