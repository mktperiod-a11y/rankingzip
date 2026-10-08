import type { RankingPage } from './data';

const leaderQuestions: Record<string, string> = {
  'korean-drama-ratings': '이 표에서 최고 시청률을 기록한 드라마는?',
  'world-tallest-buildings': '이 표에서 가장 높은 빌딩은?',
  'world-population': '이 자료의 인구 1위 국가는?',
  'world-gdp-ranking': '이 자료의 명목 GDP 1위 국가는?',
  'world-highest-mountains': '세계에서 가장 높은 산은?',
  'korea-highest-mountains': '이 표에서 가장 높은 산은?',
  'most-visited-countries': '이 자료에서 관광객이 가장 많이 방문한 나라는?',
  'korea-mobile-games-users': '이 자료의 모바일 게임 사용자 수 1위는?',
  'best-selling-music-artists': '이 표의 추정 음반 판매량 1위는?',
};

export function applyFaq(pages: RankingPage[]): RankingPage[] {
  return pages.map(p => {
    const faq = p.faq.map(([q, a]): [string, string] => [q, a]);
    const top = p.rows[0];
    const question = leaderQuestions[p.slug];
    if (question && top && !p.noindex && !p.unranked) {
      faq[0] = [question, `${p.date} 자료에서 ${top.name}입니다. 표시 수치는 ${top.value}이며, ${p.basis} 기준입니다.`];
    }
    if (p.slug === 'korea-mobile-games-users') {
      faq[1] = ['매출 순위와 같은가요?', '아닙니다. 이 표는 월간 사용자 수를 비교하며, 결제 금액을 비교하는 매출 순위와 다릅니다.'];
    }
    if (p.slug === 'best-selling-music-artists') {
      faq[2] = ['인증 판매량과 순위가 다른 이유는?', '이 표는 자료에 제시된 추정 판매량 순서를 따릅니다. 인증 판매량은 별도 지표이며 집계 국가와 스트리밍 환산 범위가 달라 순서가 다를 수 있습니다.'];
      faq[3] = ['한국 가수도 포함되나요?', '이 페이지는 선택한 자료의 상위 10개 항목을 보여 줍니다. 표시되지 않은 가수의 판매량이나 전체 원자료 포함 여부를 뜻하지 않습니다.'];
    }
    if (p.slug === 'kbo-single-season-home-runs') {
      faq[1] = ['동률은 어떻게 표시하나요?', '같은 홈런 수는 공동 순위로 표시하고, 다음 순위는 앞선 기록 수만큼 건너뜁니다.'];
      faq[2] = ['어느 시즌까지 포함하나요?', `${p.date} 자료를 사용합니다. 이후 시즌은 검증된 시즌 기록을 반영한 뒤 포함합니다.`];
    }
    if (p.slug === 'korean-football-salary') {
      faq[1] = ['소속팀 정보로 연봉을 확인할 수 있나요?', '아닙니다. 소속팀과 보수 자료는 별도로 확인해야 하며, 같은 기준의 보수가 확보되기 전까지 선수 간 순위를 제공하지 않습니다.'];
    }
    return { ...p, faq };
  });
}
