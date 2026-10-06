import type { Pick } from "../../lib/trends";

// 편집 선정 "주목할 랭킹": [제목, 순위 이름, 라벨, 순위 slug]
// 홈 상단 "이번 주 주목할 랭킹" 카드에 쓰이고, 오른쪽 "지금 주목할 랭킹"은 실시간 검색어로 자동 선정하되 모자라면 이 목록으로 채웁니다.
export const editorPicks: Pick[] = [
  ["한국 야구 통산 7회·대회 5연패", "역대 아시안게임 야구 우승 국가 순위", "급상승", "asian-games-baseball-champions"],
  ["한국 3위·9월 23일 메달 집계", "2026 아시안게임 국가별 메달 순위", "대회중", "asian-games-medal-table-2026"],
  ["The Warriors 넷플릭스 영화 1위", "이번 주 넷플릭스 영화 TOP 10", "주간", "netflix-korea-films-weekly"],
  ["오디세이 천만 관객 돌파", "2026년 국내 영화 흥행", "흥행", "korea-box-office-2026"],
  ["테슬라 8월 10,400대", "수입차 브랜드 등록 순위 TOP 10", "급상승", "korea-import-car-brands"],
];
