import type { RankingPage } from './data';
import icons from '../../public/ranking-images/games/sources.json';

const icon = (name: string) => { const i = (icons as Record<string, { image: string; source: string }>)[name]; return i ? { image: i.image, imageSource: i.source } : {}; };

const mobile: [string, number][] = [['Roblox', 281], ['블록 블라스트', 202], ['Pokemon GO', 169], ['브롤스타즈', 154], ['로얄 매치', 119], ['Minecraft', 99], ['전략적 팀 전투', 89], ['좀비고등학교', 87], ['피망 뉴맞고', 76], ['쿠키런 키우기', 74]];
const pc: [string, number][] = [['리그 오브 레전드', 34.04], ['FC온라인', 9.31], ['발로란트', 8.19], ['배틀그라운드', 7.28], ['리니지 클래식', 6.3], ['오버워치', 5.84], ['서든어택', 5.55], ['메이플 스토리', 2.79], ['Roblox', 2.35], ['스타크래프트', 1.84]];

export const gamePages: RankingPage[] = [
  {
    slug: 'korea-mobile-games-users', title: '국내 인기 모바일 게임 순위', category: 'IT·게임',
    date: '2026년 8월 · 2026.09.04 발표', basis: '안드로이드+iOS 합산 월간 사용자 수(추정)',
    description: '8월 한 달 동안 국내에서 가장 많은 사람이 이용한 모바일 게임 TOP 10입니다. Roblox가 281만 명으로 1위, 블록 블라스트가 202만 명으로 뒤를 이었습니다. 모바일인덱스 추정치라 실제 이용자 수와 차이가 있을 수 있습니다.',
    source: '모바일인덱스 GAME · 26년 9월 인기 모바일 게임 순위', sourceUrl: 'https://insight-report.mobileindex.com/post/mobilegame-chart-2609',
    rows: mobile.map(([name, users], i) => ({ name, value: `${users}만 명`, note: '8월 월간 사용자 수', rank: i + 1, ...icon(name) })),
    faq: [
      ['국내 모바일 게임 사용자 수 1위는?', '2026년 8월 기준 Roblox로, 안드로이드와 iOS를 합쳐 약 281만 명이 이용했습니다.'],
      ['매출 순위와 같은가요?', '아닙니다. 이 순위는 이용한 사람 수 기준입니다. 같은 달 매출 1위는 다른 게임(SOL)입니다.'],
      ['사용자 수는 정확한 값인가요?', '모바일인덱스가 표본 데이터로 추정한 값이라 실제와 차이가 있을 수 있습니다.'],
    ],
    auditDate: '2026.10.07',
  },
  {
    slug: 'korea-pc-games-share', title: '국내 인기 PC 게임 순위', category: 'IT·게임',
    date: '2026.10.06 기준', basis: '전국 PC방 게임 이용 시간 점유율',
    description: '전국 PC방에서 이용 시간이 가장 많은 PC 게임 TOP 10입니다. 국내 PC 게임은 사용자 수가 공개되지 않아 PC방 이용 점유율로 비교합니다. 리그 오브 레전드가 34.04%로 1위입니다.',
    source: '게임트릭스 · PC방 게임 순위', sourceUrl: 'https://www.gametrics.com/',
    rows: pc.map(([name, share], i) => ({ name, value: `${share}%`, note: 'PC방 이용 시간 점유율', rank: i + 1 })),
    faq: [
      ['왜 사용자 수가 아니라 점유율인가요?', '국내 PC 게임은 게임사가 사용자 수를 정기적으로 공개하지 않습니다. 대신 전국 PC방 이용 시간을 집계한 점유율이 매일 공개됩니다.'],
      ['집에서 하는 사람도 포함되나요?', '아니요. PC방 이용만 집계하므로 집에서 많이 하는 게임은 실제보다 낮게 나올 수 있습니다.'],
      ['PC방 점유율 1위는?', '2026년 10월 6일 기준 리그 오브 레전드로 34.04%입니다.'],
    ],
    auditDate: '2026.10.07',
  },
];
