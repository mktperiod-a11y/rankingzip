// 넷플릭스 대한민국 주간 TOP 10. 순위 데이터는 data/rankings/*.json에 있고,
// scripts/update-netflix.mjs가 매주 넷플릭스 공개 데이터로 갱신합니다. 이 파일은 그 데이터로 화면 문구를 만듭니다.
import type { RankingPage } from './data';
import filmsData from '../../data/rankings/netflix-korea-films-weekly.json';
import tvData from '../../data/rankings/ott-content-weekly.json';
import titlesKo from '../../data/rankings/netflix-titles-ko.json';

export type WeeklyChart = {
  source: string;
  weekStart: string;
  weekEnd: string;
  checkedAt: string;
  rows: { rank: number; title: string; season: string; weeks: number | null; titleKo?: string; videoId?: number; image?: string }[];
};

type ChartContent = Pick<RankingPage, 'date' | 'description' | 'rows' | 'faq'>;

const parts = (iso: string) => { const [y, m, d] = iso.split('-').map(Number); return { y, m, d }; };
const pad = (n: number) => String(n).padStart(2, '0');

/** "2026.09.14~09.20 · 9월 24일 확인" */
function dateLine(c: WeeklyChart) {
  const s = parts(c.weekStart), e = parts(c.weekEnd), k = parts(c.checkedAt);
  const end = s.y === e.y ? `${pad(e.m)}.${pad(e.d)}` : `${e.y}.${pad(e.m)}.${pad(e.d)}`;
  return `${s.y}.${pad(s.m)}.${pad(s.d)}~${end} · ${k.m}월 ${k.d}일 확인`;
}

/** "9월 14일부터 20일까지" (repeatMonth면 "9월 14일부터 9월 20일까지"). 달이 바뀌면 항상 "9월 28일부터 10월 4일까지" */
function spanKo(c: WeeklyChart, repeatMonth = false) {
  const s = parts(c.weekStart), e = parts(c.weekEnd);
  return `${s.m}월 ${s.d}일부터 ${repeatMonth || s.m !== e.m ? `${e.m}월 ` : ''}${e.d}일까지`;
}

const fullTitle = (r: WeeklyChart['rows'][number]) => (r.season ? `${r.title}: ${r.season}` : r.title);
const manualKo = titlesKo as Record<string, string>;
const koOf = (r: WeeklyChart['rows'][number]) => r.titleKo || manualKo[r.title];
const nameOf = (r: WeeklyChart['rows'][number]) => koOf(r) || r.title;

/** "Season 2" → "시즌 2", "Limited Series" → "리미티드 시리즈", "Part 33" → "파트 33" */
export function seasonKo(season: string) {
  return season.replace(/\bLimited Series\b/i, '리미티드 시리즈').replace(/\bSeason (\d+)/i, '시즌 $1').replace(/\bPart (\d+)/i, '파트 $1').replace(/\bVolume (\d+)/i, '볼륨 $1');
}
const row = (r: WeeklyChart['rows'][number], note: string) => ({ name: nameOf(r), value: `${r.rank}위`, note, ...(r.image ? { image: r.image } : {}) });

export function filmsContent(c: WeeklyChart): ChartContent {
  const s = parts(c.weekStart), top = nameOf(c.rows[0]);
  return {
    date: dateLine(c),
    description: `넷플릭스가 공개한 대한민국 영화 최신 완료 주간 순위입니다. 1위는 ${top}이며, TV 프로그램 순위나 오늘의 앱 순위와는 다릅니다. 한국 시청수는 공개하지 않아 별도로 추정하지 않습니다.`,
    rows: c.rows.map((r) => row(r, r.weeks ? `한국 영화 주간 차트 · TOP 10 진입 ${r.weeks}주` : '한국 영화 주간 차트')),
    faq: [
      ['이번 주는 정확히 언제인가요?', `${s.y}년 ${spanKo(c, true)}입니다. 확인 시점에 공개된 최신 완료 주간 차트입니다.`],
      ['이번 주 넷플릭스 한국 영화 1위는?', `${spanKo(c)} 한국 영화 차트 1위는 ${top}입니다.`],
      ['오늘 넷플릭스 앱 순위와 왜 다른가요?', '이 페이지는 일간 차트가 아닌 공식 주간 집계를 사용합니다.'],
    ],
  };
}

export function tvContent(c: WeeklyChart): ChartContent {
  const s = parts(c.weekStart), e = parts(c.weekEnd);
  return {
    date: dateLine(c),
    description: `Netflix의 ${s.y}년 ${s.m}월 ${s.d}일~${e.m}월 ${e.d}일 대한민국 TV 차트입니다. 전체 OTT 통합 순위가 아닙니다.${c.rows.every((r) => koOf(r)) ? '' : ' 한국어 제목을 확인하지 못한 작품은 공식 차트의 영문명을 씁니다.'}`,
    rows: c.rows.map((r) => row(r, [koOf(r) && r.season ? seasonKo(r.season) : r.season, r.weeks ? `TOP 10 진입 ${r.weeks}주` : ''].filter(Boolean).join(' · '))),
    faq: [
      ['이번 주 넷플릭스 한국 TV 1위는?', `${spanKo(c, true)} 1위는 ${koOf(c.rows[0]) ? `${koOf(c.rows[0])}${c.rows[0].season ? ` ${seasonKo(c.rows[0].season)}` : ''}` : fullTitle(c.rows[0])}입니다.`],
      ['순위는 언제 바뀌나요?', '넷플릭스가 매주 발표하는 공식 국가별 Top 10에 맞춰 갱신됩니다.'],
      ['모든 OTT를 합친 순위인가요?', '아니요. 현재 표는 넷플릭스 한국 TV 차트입니다.'],
    ],
  };
}

export const netflixFilms = filmsContent(filmsData as WeeklyChart);
export const netflixTv = tvContent(tvData as WeeklyChart);
