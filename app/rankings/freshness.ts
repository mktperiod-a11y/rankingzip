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
