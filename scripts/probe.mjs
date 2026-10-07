// 임시: 자동 갱신 후보 원자료 접근 확인
import fs from 'node:fs';
fs.mkdirSync('data/probe', { recursive: true });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const T = [
  ['gametrics', 'https://www.gametrics.com/'],
  ['ufc', 'https://www.ufc.com/rankings'],
  ['kobis-yearly', 'https://www.kobis.or.kr/kobis/business/stat/boxs/findYearlyBoxOfficeList.do?loadEnd=0&searchType=search&sSearchYearFrom=2026'],
  ['kobis-former', 'https://www.kobis.or.kr/kobis/business/stat/boxs/findFormerBoxOfficeList.do?loadEnd=0&searchType=search'],
  ['bom-world-2026', 'https://www.boxofficemojo.com/year/world/2026/'],
  ['numbers-spiderman', 'https://www.the-numbers.com/movies/franchise/Spider-Man'],
  ['kaida', 'https://www.kaida.co.kr/ko/statistics/NewRegistStatistics.do'],
  ['kaida-home', 'https://www.kaida.co.kr/'],
  ['danawa', 'https://auto.danawa.com/auto/?Work=record&Tab=Model&Month=2026-09-00'],
  ['mois', 'https://jumin.mois.go.kr/statMonth.do'],
  ['kbo-team', 'https://www.koreabaseball.com/Record/TeamRank/TeamRankDaily.aspx'],
  ['kbo-hr', 'https://www.koreabaseball.com/Record/Player/HitterBasic/Basic1.aspx?sort=HR_CN'],
  ['kbo-crowd', 'https://www.koreabaseball.com/Record/Crowd/GraphTeam.aspx'],
  ['mobileindex-2610', 'https://insight-report.mobileindex.com/post/mobilegame-chart-2610'],
  ['mobileindex-2609', 'https://insight-report.mobileindex.com/post/mobilegame-chart-2609'],
  ['ctbuh', 'https://www.skyscrapercenter.com/buildings'],
  ['imf', 'https://www.imf.org/external/datamapper/api/v1/NGDPD?periods=2026'],
];
const log = [];
for (const [k, u] of T) {
  try {
    const r = await fetch(u, { headers: { 'user-agent': UA, 'accept-language': 'ko-KR,ko;q=0.9' }, signal: AbortSignal.timeout(30000) });
    const t = await r.text();
    fs.writeFileSync(`data/probe/${k}.html`, t.slice(0, 1500000));
    log.push(`${k} ${r.status} ${r.headers.get('content-type')} ${t.length} ${r.url}`);
  } catch (e) { log.push(`${k} ERR ${e.message}`); }
}
fs.writeFileSync('data/probe/log.txt', log.join('\n') + '\n');
console.log(log.join('\n'));
