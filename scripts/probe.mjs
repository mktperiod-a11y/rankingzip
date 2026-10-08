// 임시: 2차 원자료 확인
import fs from 'node:fs';
fs.mkdirSync('data/probe', { recursive: true });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const log = [];
const save = async (k, url, opt = {}) => {
  try { const r = await fetch(url, { ...opt, headers: { 'user-agent': UA, 'accept-language': 'ko-KR', ...(opt.headers ?? {}) } }); const t = await r.text(); fs.writeFileSync(`data/probe/${k}`, t.slice(0, 600000)); log.push(`${k} ${r.status} ${r.headers.get('content-type')} ${t.length}`); }
  catch (e) { log.push(`${k} ERR ${e.message}`); }
};
const form = (o) => ({ method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8', 'x-requested-with': 'XMLHttpRequest' }, body: new URLSearchParams(o).toString() });
await save('kbo-crowd.json', 'https://www.koreabaseball.com/ws/Record.asmx/GetCrowdTeam', form({ leagueId: '1', seriesId: '0', gameMonth: '2026' }));
await save('kbo-crowd-page.html', 'https://www.koreabaseball.com/Record/Crowd/GraphTeam.aspx');
await save('mois-get.html', 'https://jumin.mois.go.kr/statMonth.do');
await save('mois-post.html', 'https://jumin.mois.go.kr/statMonth.do', form({ sltOrgType: '1', sltOrgLvl1: 'A', sltOrgLvl2: 'A', gender: 'gender', genderPer: 'genderPer', generation: 'generation', sltUndefType: '', searchYearMonth: 'month', searchYearStart: '2026', searchMonthStart: '09', searchYearEnd: '2026', searchMonthEnd: '09', sltOrderType: '1', sltOrderValue: 'ASC', search: 'search' }));
await save('kaida-list.html', 'https://www.kaida.co.kr/ko/statistics/NewRegistList.do');
await save('kaida-share.html', 'https://www.kaida.co.kr/ko/statistics/kaidaShareList.do');
fs.writeFileSync('data/probe/log.txt', log.join('\n') + '\n');
console.log(log.join('\n'));
