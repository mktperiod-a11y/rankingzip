import type { RankingPage } from './data';

const sourceUrl = 'https://www.yna.co.kr/view/AKR20260920054553007';
const medals: [string,string,number,number,number][] = [
  ['중국','cn',48,20,10],
  ['일본','jp',15,25,27],
  ['대한민국','kr',8,8,25],
  ['카자흐스탄','kz',7,4,8],
  ['태국','th',5,3,4],
  ['홍콩','hk',3,6,7],
  ['이란','ir',3,3,2],
  ['말레이시아','my',3,1,5],
  ['북한','kp',2,1,3],
  ['쿠웨이트','kw',2,1,2],
];

export const asianGamesPages: RankingPage[] = [{
  slug:'asian-games-baseball-champions',
  title:'역대 아시안게임 야구 우승 국가 순위',
  category:'스포츠',
  date:'2026.09.27 결승 종료 기준',
  basis:'1994년 정식 종목 채택 이후 국가별 금메달 횟수',
  description:'한국이 2026 아이치·나고야 아시안게임 결승에서 일본을 꺾고 5회 연속 우승을 달성했습니다. 1994년 야구가 정식 종목이 된 뒤 한국은 통산 7번째 금메달로 역대 1위를 더욱 굳혔습니다.',
  source:'KBO · 2026 아시안게임 일정/결과',
  sourceUrl:'https://www.koreabaseball.com/Schedule/International/AsianGames/Main2026.aspx',
  rows:[
    {name:'대한민국',value:'금메달 7회',note:'1998·2002·2010·2014·2018·2022·2026',image:'https://flagcdn.com/w640/kr.png',sourceUrl:'https://www.koreabaseball.com/Schedule/International/AsianGames/Main2026.aspx'},
    {name:'일본',value:'금메달 1회',note:'1994 히로시마 대회 우승',image:'https://flagcdn.com/w640/jp.png',sourceUrl:'https://www.japan-baseball.jp/en/team/amateur/2026/asiangames/overview.html'},
    {name:'차이니스 타이베이',value:'금메달 1회',note:'2006 도하 대회 우승',image:'/ranking-images/flags/chinese-taipei.png',sourceUrl:'https://www.koreabaseball.com/Schedule/International/AsianGames/Main2026.aspx'},
  ],
  auditDate:'2026.09.28',
  faq:[
    ['아시안게임 야구 최다 우승 국가는 어디인가요?','2026년 대회 종료 기준 대한민국이 금메달 7개로 가장 많습니다.'],
    ['한국 야구는 몇 회 연속 우승했나요?','2010 광저우 대회부터 2026 아이치·나고야 대회까지 5회 연속 우승했습니다.'],
    ['1990년 대회는 왜 포함하지 않나요?','1990 베이징 대회 야구는 시범 종목이었고, 정식 메달 종목은 1994 히로시마 대회부터이기 때문입니다.'],
  ],
},{
  slug:'asian-games-medal-table-2026',
  title:'2026 아시안게임 국가별 메달 순위',
  category:'스포츠',
  date:'2026.09.23 경기 종료 기준 · 22:08 발표',
  basis:'금메달 수 우선 · 은메달, 동메달 순 · 상위 10개 국가·지역',
  description:'아이치·나고야 아시안게임 9월 23일 경기 종료 후 국가별 메달 순위입니다. 중국이 금메달 48개로 1위, 일본이 15개로 2위, 대한민국이 8개로 3위입니다. 대회 중 수치는 매일 바뀔 수 있습니다.',
  source:'연합뉴스 · 2026 아이치·나고야 아시안게임 메달 순위(23일)',
  sourceUrl,
  rows:medals.map(([name,code,gold,silver,bronze])=>({
    name,
    value:`금 ${gold} · 은 ${silver} · 동 ${bronze}`,
    note:`총 ${gold+silver+bronze}개 · 금메달 수 우선 순위`,
    image:`https://flagcdn.com/w640/${code}.png`,
    sourceUrl,
  })),
  auditDate:'2026.09.24',
  faq:[
    ['대한민국은 현재 몇 위인가요?','9월 23일 경기 종료 기준 금메달 8개, 은메달 8개, 동메달 25개로 종합 3위입니다.'],
    ['총메달이 많은 나라가 더 낮을 수도 있나요?','네. 아시안게임 종합 순위는 총메달 수가 아니라 금메달 수를 먼저 비교하고, 같으면 은메달과 동메달 수를 차례로 봅니다.'],
    ['이 순위는 최종 결과인가요?','아닙니다. 2026년 9월 23일 경기 종료 기준 중간 집계이며 대회가 진행되면 바뀝니다.'],
  ],
}];
