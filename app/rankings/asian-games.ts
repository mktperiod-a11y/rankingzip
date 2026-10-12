import type { RankingPage } from './data';

const sourceUrl = 'https://www.yna.co.kr/view/AKR20261002184252007';
const medalDate = '2026.10.04';
const medalRows = [
  ['중국', 'cn', 169, 89, 83],
  ['일본', 'jp', 83, 95, 91],
  ['대한민국', 'kr', 39, 43, 68],
  ['인도', 'in', 21, 27, 37],
  ['우즈베키스탄', 'uz', 21, 25, 24],
  ['이란', 'ir', 19, 18, 15],
  ['태국', 'th', 18, 13, 21],
  ['카자흐스탄', 'kz', 12, 24, 48],
  ['홍콩', 'hk', 11, 19, 24],
  ['바레인', 'bh', 11, 5, 6],
] as [string, string, number, number, number][];
const medals = medalRows.map(([name, code, gold, silver, bronze], i) => ({
  name, rank: i + 1,
  value: `금 ${gold} · 은 ${silver} · 동 ${bronze}`,
  note: `총 ${gold + silver + bronze}개 · 금메달 수 우선 순위`,
  image: `https://flagcdn.com/w640/${code}.png`, sourceUrl,
}));
const korea = medals.find(row => row.name === '대한민국')!;

export const asianGamesPages: RankingPage[] = [{
  slug:'asian-games-baseball-champions',
  title:'역대 아시안게임 야구 메달 순위',
  category:'스포츠',
  date:'2026.09.27 결승 종료 기준',
  basis:'1994년 정식 종목 채택 이후 금·은·동메달 순 · 메달 수가 같으면 공동 순위',
  description:'1994년 야구가 아시안게임 정식 종목이 된 뒤 9개 대회의 국가별 메달 순위입니다. 한국은 2026 아이치·나고야 대회에서 5회 연속 우승하며 금메달 7개로 1위이고, 일본과 차이니스 타이베이는 금 1·은 4·동 4개로 메달 수가 같아 공동 2위입니다.',
  source:'Wikipedia · Baseball at the Asian Games',
  sourceUrl:'https://en.wikipedia.org/wiki/Baseball_at_the_Asian_Games',
  rows:[
    {name:'대한민국',value:'금 7 · 은 1 · 동 1',note:'우승 1998·2002·2010·2014·2018·2022·2026',rank:1,image:'https://flagcdn.com/w640/kr.png',sourceUrl:'https://www.koreabaseball.com/Schedule/International/AsianGames/Main2026.aspx'},
    {name:'일본',value:'금 1 · 은 4 · 동 4',note:'우승 1994 히로시마',rank:2,image:'https://flagcdn.com/w640/jp.png',sourceUrl:'https://www.japan-baseball.jp/en/team/amateur/2026/asiangames/overview.html'},
    {name:'차이니스 타이베이',value:'금 1 · 은 4 · 동 4',note:'우승 2006 도하',rank:2,image:'/ranking-images/flags/chinese-taipei.png',sourceUrl:'https://en.wikipedia.org/wiki/Baseball_at_the_Asian_Games'},
  ],
  auditDate:'2026.10.12',
  faq:[
    ['아시안게임 야구 최다 우승 국가는 어디인가요?','2026년 대회 종료 기준 대한민국이 금메달 7개로 가장 많습니다.'],
    ['일본과 차이니스 타이베이는 왜 공동 2위인가요?','두 팀 모두 금메달 1개, 은메달 4개, 동메달 4개로 메달 수가 같기 때문입니다.'],
    ['한국 야구는 몇 회 연속 우승했나요?','2010 광저우 대회부터 2026 아이치·나고야 대회까지 5회 연속 우승했습니다.'],
    ['다른 나라는 메달이 없나요?','1994년 이후 메달은 한국·일본·차이니스 타이베이 세 팀만 땄습니다. 중국은 매 대회 4위였습니다.'],
    ['1990년 대회는 왜 포함하지 않나요?','1990 베이징 대회 야구는 시범 종목이었고, 정식 메달 종목은 1994 히로시마 대회부터이기 때문입니다.'],
  ],
},{
  slug:'asian-games-medal-table-2026',
  title:'2026 아시안게임 국가별 메달 순위',
  category:'스포츠',
  date:`${medalDate} 최종 집계`,
  dataLabel:`연합뉴스 ${medalDate} 최종 메달 집계`,
  basis:'금메달 수 우선 · 은메달, 동메달 순 · 상위 10개 국가·지역',
  description:`${medalDate} 종료된 아이치·나고야 아시안게임 최종 메달 순위입니다. 대한민국은 ${korea.value}개로 종합 ${korea.rank}위입니다.`,
  source:'연합뉴스 · 2026 아시안게임 최종 메달 순위',
  sourceUrl,
  rows:medals,
  auditDate:'2026.10.08',
  faq:[
    ['대한민국의 최종 순위는 몇 위인가요?',`${medalDate} 최종 집계 기준 종합 ${korea.rank}위입니다. 메달 수는 ${korea.value}개입니다.`],
    ['총메달이 많은 나라가 더 낮을 수도 있나요?','네. 아시안게임 종합 순위는 총메달 수가 아니라 금메달 수를 먼저 비교하고, 같으면 은메달과 동메달 수를 차례로 봅니다.'],
    ['이 순위는 최종 결과인가요?',`네. ${medalDate} 대회 종료 후 발표된 최종 집계입니다. 이후 공식 기록이 정정되면 수정될 수 있습니다.`],
  ],
}];
