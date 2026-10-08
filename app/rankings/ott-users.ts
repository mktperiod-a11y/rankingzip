import type { RankingPage } from './data';
import data from '../../data/rankings/ott-users.json';

const [year, month] = data.month.split('-');
const period = `${year}년 ${Number(month)}월`;
export const ottUsersRanking: Partial<RankingPage> = {
  title: '국내 OTT 앱 사용자 순위',
  date: period,
  auditDate: data.publishedAt.replaceAll('-', '.'),
  basis: '한국인 Android·iOS 스마트폰 앱 월간 사용자 추정치',
  dataLabel: `${data.source} ${period} 조사`,
  description: `${period} 국내 OTT 앱의 월간 사용자 수를 비교합니다. 라프텔·왓챠를 포함하며, 같은 조사기관·기준월의 자료를 사용합니다.`,
  source: data.source,
  sourceUrl: data.sourceUrl,
  rows: data.rows.map(row => ({ name: row.name, value: `${(row.users / 10000).toLocaleString('ko-KR')}만명`, note: '', sourceUrl: data.sourceUrl })),
  faq: [
    ['실시간 이용자 수인가요?', '월간 활성 사용자(MAU) 추정치입니다. 새 공개 자료를 확인한 뒤 갱신하며, 기준월은 페이지 상단에 표시합니다.'],
    ['가입자 수나 PC·TV 이용도 포함되나요?', '유료 가입자 수가 아닌 한국인 Android·iOS 스마트폰 앱 사용자 표본 조사입니다. PC·TV 이용은 포함하지 않습니다.'],
  ],
};
