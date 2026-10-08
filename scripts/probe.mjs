// 임시: 2차 원자료 재시도(쿠키·리퍼러)
import fs from 'node:fs';
fs.mkdirSync('data/probe', { recursive: true });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const log = [];
const cookieOf = (r) => (r.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).join('; ');
const save = async (k, url, opt = {}) => {
  try { const r = await fetch(url, { ...opt, headers: { 'user-agent': UA, 'accept-language': 'ko-KR', ...(opt.headers ?? {}) } }); const t = await r.text(); fs.writeFileSync(`data/probe/${k}`, t.slice(0, 600000)); log.push(`${k} ${r.status} ${r.headers.get('content-type')} ${t.length}`); return r; }
  catch (e) { log.push(`${k} ERR ${e.message}`); }
};
const form = (o, extra = {}) => ({ method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8', 'x-requested-with': 'XMLHttpRequest', ...extra }, body: new URLSearchParams(o).toString() });
// KBO
const kp = await fetch('https://www.koreabaseball.com/Record/Crowd/GraphTeam.aspx', { headers: { 'user-agent': UA } });
const kc = cookieOf(kp);
await save('kbo-crowd.json', 'https://www.koreabaseball.com/ws/Record.asmx/GetCrowdTeam', form({ leagueId: '1', seriesId: '0', gameMonth: '2026' }, { cookie: kc, referer: 'https://www.koreabaseball.com/Record/Crowd/GraphTeam.aspx', origin: 'https://www.koreabaseball.com', accept: 'application/json, text/javascript, */*; q=0.01' }));
// KAIDA
const ap = await fetch('https://www.kaida.co.kr/ko/statistics/NewRegistList.do', { headers: { 'user-agent': UA } });
const ac = cookieOf(ap);
for (const [k, ym] of [['kaida-202609.json', '202609'], ['kaida-202608.json', '202608']]) await save(k, 'https://www.kaida.co.kr/ko/statistics/NewRegistListAjax.do', form({ programId: '117', layId: 'NewBrandSummary', searchStart: ym, searchEnd: ym, regionId: '', buytypeId: '' }, { cookie: ac, referer: 'https://www.kaida.co.kr/ko/statistics/NewRegistList.do', accept: 'application/json, text/javascript, */*; q=0.01' }));
// 행안부
const mp = await fetch('https://jumin.mois.go.kr/statMonth.do', { headers: { 'user-agent': UA } });
const mc = cookieOf(mp);
const mf = { sltOrgType: '1', sltOrgLvl1: 'A', sltOrgLvl2: 'A', gender: 'gender', genderPer: 'genderPer', generation: 'generation', sltUndefType: '', searchYearStart: '2026', searchMonthStart: '09', searchYearEnd: '2026', searchMonthEnd: '09', sltOrderType: '1', sltOrderValue: 'ASC', category: 'month' };
await save('mois-post.html', 'https://jumin.mois.go.kr/statMonth.do', form(mf, { cookie: mc, referer: 'https://jumin.mois.go.kr/statMonth.do' }));
await save('mois-csv.txt', 'https://jumin.mois.go.kr/downloadCsv.do?searchYearMonth=month&xlsStats=1', form(mf, { cookie: mc, referer: 'https://jumin.mois.go.kr/statMonth.do' }));
fs.writeFileSync('data/probe/log.txt', log.join('\n') + '\n');
console.log(log.join('\n'));
