import type { RankingPage } from './data';
import { dateParts } from './date-parts';

const DATA_LABEL: Record<string, string> = {
  'asian-games-baseball-champions': 'KBO 2026.09.27 결승 종료 데이터',
  'asian-games-medal-table-2026': '연합뉴스 2026.09.23 22:08 발표 데이터',
 
 
 
  'kbo-single-season-home-runs': 'KBO 역대 기록실 2025시즌 종료 데이터',
 
 
 
 
 
 
 
  'korean-drama-ratings': '나무위키 시청률 TOP 100 데이터',
 
 
 
  'korea-highest-mountains': '산림청·국립공원공단 고도 데이터',
  'korea-mobile-games-users': '모바일인덱스 2026년 8월 데이터',
 
  'file-sharing-services': '순위ZIP 자체 선정',
  'highest-paid-athletes': 'Forbes 2026.05.22 발표 데이터',
  'world-tallest-buildings': 'CTBUH 2026.08.27 확인 데이터',
  'world-population': 'UNFPA 2025년 중간연도 데이터',
  'world-gdp-ranking': 'IMF WEO 2026년 전망 데이터',
  'world-largest-countries': 'World Bank 2023년 데이터',
  'world-highest-mountains': '산별 백과사전 고도 데이터',
  'most-visited-countries': 'UN Tourism 2024년 데이터',
};
const WEEKLY_SOURCE: Record<string, string> = { 'netflix-korea-films-weekly': 'Netflix', 'ott-content-weekly': 'Netflix' };

const VALUE_LABEL: Record<string, string> = {
 
 
  'korean-drama-ratings': '최고 시청률',
  'korea-ott-users': '월 사용자', 'highest-paid-athletes': '연 수입', 'world-tallest-buildings': '높이',
  'world-population': '인구', 'korea-highest-mountains': '해발',
  'world-gdp-ranking': '명목 GDP', 'world-largest-countries': '육지 면적', 'world-highest-mountains': '해발',
  'most-visited-countries': '관광객', 'korea-mobile-games-users': '월 사용자',
  'anime-all-time-popular': '목록 등록', 'anime-season-poll': '득표율', 'best-selling-music-artists': '판매량',
};

const FILLER = new Set(['순위', '기준', '공식', '차트', '데이터', '자료', '한국', '대한민국']);
const words = (s: string) => s.replace(/\([^)]*\)/g, '').split(/[\s·,]+/).map(w => w.replace(/[^\p{L}\p{N}+~.]/gu, '')).filter(w => w && !FILLER.has(w));

export function rankingPresentation(p: RankingPage) {
  const dates = dateParts(p.date, p.auditDate);
  const parts = p.rows.map(r => r.note.split(' · ').map(s => s.trim()).filter(Boolean));
  const shared = parts.length > 1
    ? [...new Set(parts[0])].filter(s => parts.every(row => row.includes(s)))
    : [];
  const label = p.dataLabel ?? DATA_LABEL[p.slug]
    ?? (WEEKLY_SOURCE[p.slug] && dates.reference ? `${WEEKLY_SOURCE[p.slug]} ${dates.reference} 주간 데이터` : dates.reference);
  const seen = new Set(words(label ?? ''));
  const criteria = [label, ...[p.basis, ...shared].flatMap(s => s.split(' · '))]
    .filter((s): s is string => !!s)
    .filter((s, i) => {
      if (i === 0) return true;
      const w = words(s);
      if (w.every(x => seen.has(x))) return false;
      w.forEach(x => seen.add(x));
      return true;
    });
  return {
    basis: criteria.join(' · '),
    valueLabel: VALUE_LABEL[p.slug],
    updated: dates.updated,
    notes: parts.map(row => row.filter(s => !shared.includes(s) && !/^\d+위(?:권)?$/.test(s)).join(' · ')),
  };
}
