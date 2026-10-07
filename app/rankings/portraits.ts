// 인물 사진 규칙: 위키미디어 공용의 자유 이용 사진(CC BY·CC BY-SA·CC0·퍼블릭 도메인·영국 OGL)만 씁니다.
// 사진은 scripts/fetch-portraits.mjs가 선수 본인 위키백과 문서의 대표 사진으로 받아 portraits/credits.json에 작가·라이선스와 함께 기록합니다.
// 야구 선수는 사진 대신 모두 구단 로고로 보여줍니다(옛 구단명은 지금 구단 로고). 그 밖에 자유 이용 사진이 없으면 이니셜입니다.
// 공식 사이트·언론 사진은 쓰지 않습니다.
import credits from '../../public/ranking-images/portraits/credits.json';
import type { RankingPage } from './data';

export type PortraitCredit = { image: string; source: string; license: string; licenseUrl?: string; author: string; article: string };
export const PORTRAITS = credits as Record<string, PortraitCredit>;

/** 인물 사진을 쓰는 순위 */
export const PERSON_SLUGS = ['ufc-rankings-by-division', 'kbo-home-runs-2026', 'kbo-rbi-2026', 'kbo-single-season-home-runs', 'highest-paid-athletes', 'korean-football-salary', 'mlb-korean-career-earnings', 'japan-av-actress-ranking', 'best-selling-music-artists'];

const KBO_LOGO: Record<string, string> = { KIA: 'KIA', LG: 'LG', KT: 'KT', 삼성: 'Samsung', 한화: 'Hanwha', 두산: 'Doosan', NC: 'NC', SSG: 'SSG', 키움: 'Kiwoom', 롯데: 'Lotte' };
/** 옛 구단명 → 지금 구단 (현대 유니콘스처럼 이어지는 구단이 없으면 로고 없이 이니셜) */
const FORMER: Record<string, string> = { OB: 'Doosan', SK: 'SSG', 넥센: 'Kiwoom', 해태: 'KIA' };
const BASEBALL_SLUGS = ['kbo-home-runs-2026', 'kbo-rbi-2026', 'kbo-single-season-home-runs'];

/** "이승엽 · 2003"처럼 이름 뒤에 붙은 설명은 떼고 찾습니다. */
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
      r.image = portraitOf(r.name)?.image;
    }
  }
  return pages;
}
