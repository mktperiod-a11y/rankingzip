// 홈 카드의 갱신 표시. 순위마다 자료가 바뀌는 방식이 달라 세 가지로 나눕니다.
// - auto: GitHub Actions가 원자료를 자동으로 받아 갱신. 라벨은 마지막으로 새 자료를 받은 날, 아래 문구는 실제 실행 주기입니다.
// - checked: 사람이 원자료 발표에 맞춰 직접 확인. 라벨은 마지막 확인일, 아래 문구는 원자료 발표 주기입니다.
// - fixed: 역대 기록·지형처럼 사실상 바뀌지 않는 순위. 라벨은 "변동 없음"이고 주기 문구는 없습니다.
// 자동 갱신 일정은 .github/workflows/update-data.yml(넷플릭스·애니·기록 순위), update-webhard.yml(웹하드)에 있습니다.
export type Freshness = { kind: 'auto' | 'checked' | 'fixed'; cycle?: string };

const auto = (cycle: string): Freshness => ({ kind: 'auto', cycle });
const checked = (cycle: string): Freshness => ({ kind: 'checked', cycle });
const FIXED: Freshness = { kind: 'fixed' };

export const FRESHNESS: Record<string, Freshness> = {
  'netflix-korea-films-weekly': auto('매주 수요일'), 'ott-content-weekly': auto('매주 수요일'),
  'anime-all-time-popular': auto('매주 수·토요일'), 'anime-season-poll': auto('매주 수·토요일'),
  'file-sharing-services': auto('2일마다'),

  'kbo-team-standings-2026': auto('매주 수·토요일'), 'kbo-home-runs-2026': auto('매주 수·토요일'), 'kbo-rbi-2026': auto('매주 수·토요일'), 'kbo-attendance-2026': auto('매주 수·토요일'),
  'ufc-rankings-by-division': auto('매주 수·토요일'),
  'korea-box-office-2026': auto('매주 수·토요일'), 'korean-movie-admissions': auto('매주 수·토요일'), 'worldwide-box-office-2026': auto('매주 수·토요일'),
  'christopher-nolan-korea-box-office': auto('매주 수·토요일'), 'spider-man-worldwide-box-office': auto('매주 수·토요일'),
  'korea-pc-games-share': auto('매주 수·토요일'),
  'korea-import-car-brands': auto('매주 수·토요일'), 'korea-car-sales': auto('매주 수·토요일'), 'korea-province-population': auto('매주 수·토요일'), 'korea-mobile-games-users': checked('매월'),
  'highest-paid-athletes': checked('매년 5월'), 'world-gdp-ranking': checked('매년 4·10월'), 'world-population': checked('매년'), 'most-visited-countries': checked('매년'),
  'best-selling-music-artists': checked('매년'),

  'asian-games-baseball-champions': FIXED, 'asian-games-medal-table-2026': FIXED, 'kbo-single-season-home-runs': FIXED,
  'korean-drama-ratings': FIXED, 'korea-ott-users': FIXED, 'world-tallest-buildings': FIXED,
  'world-largest-countries': FIXED, 'world-highest-mountains': FIXED, 'korea-highest-mountains': FIXED,
};
