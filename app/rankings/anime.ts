import type { RankingPage } from './data';
import allTimeData from '../../data/rankings/anime-all-time.json';
import weeklyData from '../../data/rankings/anime-weekly.json';
import titlesKo from '../../data/rankings/anime-titles-ko.json';

type AnimeRow = { rank: number; title: string; id?: number; titleKo?: string; image?: string; url?: string };
type AllTime = { source: string; checkedAt: string; rows: (AnimeRow & { popularity: number; year: number | null; format: string })[] };
type Weekly = { source: string; season: string; year: number; week: number; publishedAt: string; checkedAt: string; rows: (AnimeRow & { votes: string })[] };

const manualKo = titlesKo as Record<string, string>;
const nameOf = (r: AnimeRow) => (r.id && manualKo[r.id]) || manualKo[r.title] || r.titleKo || r.title;
const dot = (iso: string) => iso.replaceAll('-', '.');
const SEASON: Record<string, string> = { winter: '겨울', spring: '봄', summer: '여름', fall: '가을' };
const FORMAT: Record<string, string> = { TV: 'TV 시리즈', TV_SHORT: 'TV 단편', MOVIE: '극장판', OVA: 'OVA', ONA: '웹 애니', SPECIAL: '스페셜' };
const image = (r: AnimeRow) => (r.image ? { image: r.image, ...(r.url ? { imageSource: r.url } : {}) } : {});
const TITLE_FAQ: [string, string] = ['작품 제목은 어떻게 표기하나요?', '국내 정식 제목을 우선 쓰고, 정식 제목이 확인되지 않은 작품은 영어 제목을 한국어로 옮겼습니다. 영어 원제는 각 항목 아래에 적었습니다.'];

export function allTimePage(d: AllTime): RankingPage {
  const top = d.rows[0];
  return {
    slug: 'anime-all-time-popular', title: '역대 인기 애니메이션 순위', category: '미디어', posterLayout: true,
    date: `${dot(d.checkedAt)} 조회`, dataLabel: `AniList ${dot(d.checkedAt)} 조회 데이터`,
    basis: '전 세계 AniList 회원이 목록에 담은 수 · 같은 작품의 후속 시즌·외전 제외',
    description: `전 세계 애니메이션 데이터베이스 AniList에서 회원이 가장 많이 자기 목록에 담은 애니메이션 TOP 10입니다. 같은 작품의 후속 시즌은 첫 작품 하나만 셉니다. 1위는 ${nameOf(top)}으로 ${Math.round(top.popularity / 10000)}만 명이 담았습니다. 한국 시청자만의 순위는 아닙니다.`,
    source: 'AniList · 인기순 애니메이션', sourceUrl: d.source,
    rows: d.rows.map((r) => ({ name: nameOf(r), value: `${r.popularity.toLocaleString('en-US')}명`, note: [r.title, r.year, FORMAT[r.format] ?? r.format].filter(Boolean).join(' · '), rank: r.rank, ...image(r) })),
    faq: [
      ['역대 가장 인기 있는 애니메이션은?', `AniList 회원 수 기준 ${nameOf(top)}입니다. ${dot(d.checkedAt)} 조회 시점에 ${top.popularity.toLocaleString('en-US')}명이 목록에 담았습니다.`],
      ['숫자는 시청자 수인가요?', '아닙니다. AniList 회원이 "보는 중·다 봄·볼 예정" 등 자기 목록에 담은 수입니다. 전 세계 회원 기준이라 국내 인기와 다를 수 있습니다.'],
      ['시즌별로 따로 세지 않나요?', '같은 작품의 2기·3기·외전은 빼고 첫 작품만 셉니다. 예를 들어 진격의 거인 2기는 진격의 거인에 포함되지 않고 순위에서 제외됩니다.'],
      TITLE_FAQ,
    ],
    auditDate: dot(d.checkedAt),
  };
}

export function weeklyPage(d: Weekly): RankingPage {
  const season = `${d.year} ${SEASON[d.season] ?? d.season}`;
  const top = d.rows[0];
  return {
    slug: 'anime-season-poll', title: '이번 시즌 인기 애니메이션 순위', category: '미디어', posterLayout: true,
    date: `${season} ${d.week}주차 · ${dot(d.publishedAt)} 발표 · ${dot(d.checkedAt)} 확인`, dataLabel: `Anime Corner ${season} ${d.week}주차 투표 데이터`,
    basis: '해외 팬 주간 투표 득표율 · 이번 시즌 방영작',
    description: `애니메이션 매체 Anime Corner가 매주 여는 팬 투표에서 ${season} 시즌 ${d.week}주차에 가장 많은 표를 받은 애니메이션 TOP 10입니다. 1위는 ${nameOf(top)}(${top.votes})입니다. 영어권 팬 투표라 국내 인기와 다를 수 있습니다.`,
    source: `Anime Corner · ${d.year} ${d.season[0].toUpperCase()}${d.season.slice(1)} ${d.week}주차 순위`, sourceUrl: d.source,
    rows: d.rows.map((r) => ({ name: nameOf(r), value: r.votes, note: r.title, rank: r.rank, ...image(r) })),
    faq: [
      ['이번 시즌 가장 인기 있는 애니메이션은?', `${season} ${d.week}주차 투표 기준 ${nameOf(top)}이 ${top.votes}로 1위입니다.`],
      ['어떤 투표인가요?', 'Anime Corner 독자가 그 주에 방영된 회차 중 가장 좋았던 작품에 투표한 결과입니다. 영어권 팬이 주로 참여합니다.'],
      ['언제 바뀌나요?', '시즌 중에는 매주 새 투표 결과가 나오며, 새 회차가 발표되면 자동으로 바뀝니다.'],
      TITLE_FAQ,
    ],
    auditDate: dot(d.checkedAt),
  };
}

export const animePages: RankingPage[] = [allTimePage(allTimeData as AllTime), weeklyPage(weeklyData as Weekly)];
