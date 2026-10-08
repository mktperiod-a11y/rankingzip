import type { RankingPage } from './data';

const ARTISTS: [string, string, string, string, number, number, number][] = [
  ['비틀스', 'The Beatles', '영국', '1960~1970', 295.9, 500, 600],
  ['마이클 잭슨', 'Michael Jackson', '미국', '1964~2009', 308.2, 400, 500],
  ['엘비스 프레슬리', 'Elvis Presley', '미국', '1953~1977', 235.4, 500, 500],
  ['마돈나', 'Madonna', '미국', '1979~', 193.4, 300, 400],
  ['엘턴 존', 'Elton John', '영국', '1962~', 216.8, 250, 300],
  ['퀸', 'Queen', '영국', '1971~', 201.1, 250, 300],
  ['레드 제플린', 'Led Zeppelin', '영국', '1968~1980', 143.1, 200, 300],
  ['리애나', 'Rihanna', '바베이도스', '2003~', 411.2, 230, 250],
  ['핑크 플로이드', 'Pink Floyd', '영국', '1965~2014', 124.8, 200, 250],
  ['에미넴', 'Eminem', '미국', '1996~', 345.8, 220, 220],
];

export function koCount(million: number) {
  const man = Math.round(million * 100);
  const eok = Math.floor(man / 10000), rest = man % 10000;
  if (!rest) return `${eok}억`;
  const restText = rest % 1000 === 0 ? `${rest / 1000}천만` : `${rest.toLocaleString('en-US')}만`;
  return eok ? `${eok}억 ${restText}` : restText;
}
const claim = (lo: number, hi: number) => (lo === hi ? `${koCount(hi)} 장` : `${koCount(lo)}~${koCount(hi)} 장`);

export const musicPages: RankingPage[] = [{
  slug: 'best-selling-music-artists', title: '역대 가수 음반 판매량 순위', category: '미디어',
  date: '2026.10.07 조회', dataLabel: '위키백과 2026.10.07 조회 데이터',
  basis: '음반사·언론이 밝힌 누적 판매량 순 · 음반·싱글·디지털 포함',
  description: '전 세계에서 음반을 가장 많이 판 가수 TOP 10입니다. 위키백과 "가장 많이 팔린 음악가 목록"의 순서를 따르며, 판매량은 음반사·언론이 밝힌 추정치라 범위로 적었습니다. 각국 음반협회가 인증한 판매량도 함께 적었습니다.',
  source: 'Wikipedia · List of best-selling music artists', sourceUrl: 'https://en.wikipedia.org/wiki/List_of_best-selling_music_artists',
  hideBars: true,
  rows: ARTISTS.map(([name, en, country, period, certified, lo, hi], i) => ({
    name, value: claim(lo, hi),
    rank: ARTISTS.findIndex((a) => a[5] === lo && a[6] === hi) + 1 || i + 1,
    note: `${en} · ${country} · ${period} 활동 · 인증 ${koCount(certified)} 장`,
  })),
  faq: [
    ['역대 음반을 가장 많이 판 가수는?', '비틀스입니다. 음반사·언론이 밝힌 판매량은 5억~6억 장이고, 각국 음반협회가 인증한 판매량은 2억 9,590만 장입니다.'],
    ['판매량은 정확한 수치인가요?', '아닙니다. 순위 기준인 판매량은 음반사·언론이 밝힌 추정치입니다. 인증 판매량은 협회 인증이 있는 나라만 더한 값이라 실제보다 적습니다.'],
    ['리애나·에미넴은 인증 판매량이 더 많은데 왜 아래에 있나요?', '인증 판매량에는 스트리밍 환산 수치가 들어가 최근 가수에게 유리합니다. 이 순위는 위키백과 목록처럼 추정 판매량을 기준으로 합니다.'],
    ['한국 가수는 없나요?', '2026년 10월 7일 조회한 위키백과 목록에는 한국 가수가 없습니다.'],
  ],
  auditDate: '2026.10.07',
}];
