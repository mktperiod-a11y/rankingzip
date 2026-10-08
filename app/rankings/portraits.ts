import credits from '../../public/ranking-images/portraits/credits.json';
import type { RankingPage } from './data';

export type PortraitCredit = { image: string; source: string; license: string; licenseUrl?: string; author: string; article: string };
export const PORTRAITS = credits as Record<string, PortraitCredit>;

export const PERSON_SLUGS = ['ufc-rankings-by-division', 'kbo-home-runs-2026', 'kbo-rbi-2026', 'kbo-single-season-home-runs', 'highest-paid-athletes', 'korean-football-salary', 'mlb-korean-career-earnings', 'japan-av-actress-ranking', 'best-selling-music-artists'];

export const KBO_LOGO: Record<string, string> = { KIA: 'KIA', LG: 'LG', KT: 'KT', 삼성: 'Samsung', 한화: 'Hanwha', 두산: 'Doosan', NC: 'NC', SSG: 'SSG', 키움: 'Kiwoom', 롯데: 'Lotte' };
const FORMER: Record<string, string> = { OB: 'Doosan', SK: 'SSG', 넥센: 'Kiwoom', 해태: 'KIA' };
const BASEBALL_SLUGS = ['kbo-home-runs-2026', 'kbo-rbi-2026', 'kbo-single-season-home-runs'];

const PHOTO_OVERRIDE: Record<string, string> = { '카넬로 알바레스': '/ranking-images/portraits/canelo-alvarez-photo.jpg', '핑크 플로이드': '/ranking-images/updates/pink-floyd.jpg' };

export const portraitOf = (name: string): PortraitCredit | undefined => PORTRAITS[name.split(' · ')[0]];

export function applyPortraits(pages: RankingPage[]): RankingPage[] {
  for (const p of pages) {
    if (!PERSON_SLUGS.includes(p.slug)) continue;
    for (const r of p.rows) {
      delete r.imageSource;
      if (BASEBALL_SLUGS.includes(p.slug)) {
        const team = r.note.split(' · ')[0];
        const logo = KBO_LOGO[team] ?? FORMER[team];
        r.image = logo && `/ranking-images/expansion/kbo_${logo}.webp`;
        if (FORMER[team]) r.note += ' · 로고는 지금 구단 기준';
        continue;
      }
      r.image = PHOTO_OVERRIDE[r.name.split(' · ')[0]] ?? portraitOf(r.name)?.image;
    }
  }
  return pages;
}
