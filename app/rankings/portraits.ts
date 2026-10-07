// 인물 사진 규칙: 위키미디어 공용의 자유 이용 사진(CC BY·CC BY-SA·CC0·퍼블릭 도메인)만 씁니다.
// 사진은 scripts/fetch-portraits.mjs가 선수 본인 위키백과 문서의 대표 사진으로 받아 portraits/credits.json에 작가·라이선스와 함께 기록합니다.
// 자유 이용 사진이 없으면 KBO 선수는 현재 구단 로고, 나머지는 이니셜로 보여줍니다. 공식 사이트·언론 사진은 쓰지 않습니다.
import credits from '../../public/ranking-images/portraits/credits.json';
import type { RankingPage } from './data';

export type PortraitCredit = { image: string; source: string; license: string; licenseUrl?: string; author: string; article: string };
export const PORTRAITS = credits as Record<string, PortraitCredit>;

/** 인물 사진을 쓰는 순위 */
export const PERSON_SLUGS = ['ufc-rankings-by-division', 'kbo-home-runs-2026', 'kbo-rbi-2026', 'kbo-single-season-home-runs', 'highest-paid-athletes', 'korean-football-salary', 'mlb-korean-career-earnings', 'japan-av-actress-ranking'];

const KBO_LOGO: Record<string, string> = { KIA: 'KIA', LG: 'LG', KT: 'KT', 삼성: 'Samsung', 한화: 'Hanwha', 두산: 'Doosan', NC: 'NC', SSG: 'SSG', 키움: 'Kiwoom', 롯데: 'Lotte' };

/** "이승엽 · 2003"처럼 이름 뒤에 붙은 설명은 떼고 찾습니다. */
export const portraitOf = (name: string): PortraitCredit | undefined => PORTRAITS[name.split(' · ')[0]];

export function applyPortraits(pages: RankingPage[]): RankingPage[] {
  for (const p of pages) {
    if (!PERSON_SLUGS.includes(p.slug)) continue;
    for (const r of p.rows) {
      const team = KBO_LOGO[r.note.split(' · ')[0]];
      const photo = portraitOf(r.name)?.image;
      r.image = photo ?? (p.slug.startsWith('kbo-') && team ? `/ranking-images/expansion/kbo_${team}.webp` : undefined);
      // 역대 기록은 지금 사진이라 기록 당시 모습과 다를 수 있습니다.
      if (photo && p.slug === 'kbo-single-season-home-runs') r.note += ' · 사진은 기록 당시와 다를 수 있음';
      delete r.imageSource;
    }
  }
  return pages;
}
