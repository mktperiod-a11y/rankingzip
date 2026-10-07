// 서비스·게임 순위의 대표 이미지. 2뎁스 이미지 틀에 꽉 차도록 같은 종류의 이미지로 맞춥니다.
// - OTT 앱·웹하드: 애플 앱스토어(한국) 공식 앱 아이콘(scripts/fetch-brand-images.mjs). 앱이 없는 곳은 로고 정사각 타일(scripts/normalize-logos.mjs)
// - PC 게임: 공식 사이트의 공유용 대표 이미지(og:image)
import type { RankingPage } from './data';
import apps from '../../public/ranking-images/apps/sources.json';
import pcArt from '../../public/ranking-images/games/pc-art.json';

type Img = { image: string; source: string };
const fromApps = (o: Record<string, { image?: string; source?: string }>) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v.image && v.source).map(([k, v]) => [k, { image: v.image!, source: v.source! }])) as Record<string, Img>;

const appIcons = fromApps(apps);
const BRAND: Record<string, Record<string, Img>> = {
  'korea-ott-users': appIcons,
  'file-sharing-services': {
    ...appIcons,
    파일이즈: { image: '/ranking-images/apps/tile-fileis.png', source: 'https://www.fileis.com/' },
    파일몽: { image: '/ranking-images/apps/tile-filemong.png', source: 'https://www.filemong.com/' },
    파일스타: { image: '/ranking-images/apps/tile-filestar.png', source: 'https://filestar.co.kr/' },
  },
  'korea-pc-games-share': {
    ...fromApps(pcArt),
    '리그 오브 레전드': { image: '/ranking-images/games/pc-key-league-of-legends.webp', source: 'https://www.inven.co.kr/' },
    발로란트: { image: '/ranking-images/games/pc-tile-valorant.png', source: 'https://playvalorant.com/ko-kr/' },
    서든어택: { image: '/ranking-images/games/pc-sudden-attack.webp', source: 'https://sa.nexon.com/' },
  },
};

export function applyBrandImages(pages: RankingPage[]): RankingPage[] {
  return pages.map(p => BRAND[p.slug]
    ? { ...p, rows: p.rows.map(r => BRAND[p.slug][r.name] ? { ...r, image: BRAND[p.slug][r.name].image, imageSource: BRAND[p.slug][r.name].source } : r) }
    : p);
}
