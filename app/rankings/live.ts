import type { Division, RankingPage, RankingRow } from './data';
import names from '../../data/rankings/names-ko.json';
import pcbang from '../../data/rankings/live/korea-pc-games-share.json';
import boxOffice from '../../data/rankings/live/korea-box-office-2026.json';
import admissions from '../../data/rankings/live/korean-movie-admissions.json';
import worldBox from '../../data/rankings/live/worldwide-box-office-2026.json';
import spiderMan from '../../data/rankings/live/spider-man-worldwide-box-office.json';
import carSales from '../../data/rankings/live/korea-car-sales.json';
import kboTeams from '../../data/rankings/live/kbo-team-standings-2026.json';
import kboHr from '../../data/rankings/live/kbo-home-runs-2026.json';
import kboRbi from '../../data/rankings/live/kbo-rbi-2026.json';
import ufc from '../../data/rankings/live/ufc-rankings-by-division.json';
import importCars from '../../data/rankings/live/korea-import-car-brands.json';
import kboCrowd from '../../data/rankings/live/kbo-attendance-2026.json';
import population from '../../data/rankings/live/korea-province-population.json';
import liveImages from '../../data/rankings/live-images.json';
import { KBO_LOGO } from './portraits';

type Live = Partial<Pick<RankingPage, 'date' | 'dataLabel' | 'basis' | 'description' | 'rows' | 'faq' | 'divisions' | 'p4p' | 'auditDate' | 'source' | 'sourceUrl'>>;
const N = names as { movies: Record<string, string>; people: Record<string, string>; kboPlayers: Record<string, string>; brands: Record<string, string>; kboTeams: Record<string, string> };
const dot = (iso: string) => iso.replaceAll('-', '.');
const md = (iso: string) => { const [, m, d] = iso.split('-').map(Number); return `${m}월 ${d}일`; };
const won = (n: number) => n.toLocaleString('en-US');
const movie = (en: string) => N.movies[en] ?? en;
const person = (en: string) => N.people[en] ?? en;
const tenK = (n: number) => `${Math.round(n / 10000).toLocaleString('en-US')}만`;
const usd = (n: number) => `${(n / 100000000).toFixed(1)}억 달러`;

const ym = (month: string) => { const [y, m] = month.split('-').map(Number); return { y, m }; };
const people = (v: string) => (/만/.test(v) ? Number(v.replace(/[^\d.]/g, '')) * 10000 : Number(v.replace(/[^\d]/g, '')));

const BUILDERS: Record<string, (p: RankingPage) => Live> = {
  'korea-pc-games-share': () => {
    const d = pcbang, top = d.rows[0];
    return {
      date: `${dot(d.date)} 기준`, dataLabel: `게임트릭스 ${dot(d.date)} 데이터`, auditDate: dot(d.checkedAt),
      description: `전국 PC방에서 이용 시간이 가장 많은 PC 게임 TOP 10입니다. 국내 PC 게임은 사용자 수가 공개되지 않아 PC방 이용 점유율로 비교합니다. ${top.name}가 ${top.share}%로 1위입니다.`,
      rows: d.rows.map((r) => ({ name: r.name, value: `${r.share}%`, note: 'PC방 이용 시간 점유율', rank: r.rank })),
      faq: [
        ['왜 사용자 수가 아니라 점유율인가요?', '국내 PC 게임은 게임사가 사용자 수를 정기적으로 공개하지 않습니다. 대신 전국 PC방 이용 시간을 집계한 점유율이 매일 공개됩니다.'],
        ['집에서 하는 사람도 포함되나요?', '아니요. PC방 이용만 집계하므로 집에서 많이 하는 게임은 실제보다 낮게 나올 수 있습니다.'],
        ['PC방 점유율 1위는?', `${md(d.date)} 기준 ${top.name}로 ${top.share}%입니다.`],
      ],
    };
  },
  'korea-box-office-2026': () => {
    const d = boxOffice, top = d.rows[0];
    return {
      date: `${dot(d.checkedAt)} 조회`, dataLabel: `KOBIS ${dot(d.checkedAt)} 조회 데이터`, auditDate: dot(d.checkedAt), sourceUrl: d.source,
      description: `${d.year}년 상영기간에 집계된 국내 관객 상위 10편입니다. 1위는 ${top.title}(${tenK(top.audience)} 명)입니다. 이전 연도 개봉작도 포함하며 상영 중인 작품은 순위가 바뀔 수 있습니다.`,
      rows: d.rows.map((r) => ({ name: r.title, value: `${won(r.audience)}명`, note: `${r.openDt} 개봉`, rank: r.rank })),
      faq: [
        [`${d.year}년 국내 관객 1위 영화는?`, `${md(d.checkedAt)} 조회 기준 ${top.title}로 ${won(top.audience)}명입니다.`],
        ['어떤 작품을 비교하나요?', '국내 개봉작을 비교하며 한국영화와 외국영화를 모두 포함합니다.'],
        ['수치는 계속 바뀌나요?', '상영 실적과 KOBIS 보정이 반영되면 순위와 수치가 달라질 수 있습니다.'],
      ],
    };
  },
  'korean-movie-admissions': () => {
    const d = admissions, top = d.rows[0];
    return {
      date: `${dot(d.checkedAt)} 조회`, dataLabel: `KOBIS ${dot(d.checkedAt)} 조회 데이터`, auditDate: dot(d.checkedAt),
      description: `국내 개봉작의 역대 누적 관객 상위 10편입니다. 1위는 ${top.title}(${tenK(top.audience)} 명)입니다. 재개봉과 집계 보정에 따라 수치가 달라질 수 있습니다.`,
      rows: d.rows.map((r) => ({ name: r.title, value: `${won(r.audience)}명`, note: `${r.openDt} 개봉`, rank: r.rank })),
      faq: [
        ['역대 국내 관객 1위 영화는?', `${top.title}입니다. ${md(d.checkedAt)} 조회 기준 ${won(top.audience)}명입니다.`],
        ['어떤 작품을 비교하나요?', '국내 개봉작을 비교하며 한국영화와 외국영화를 모두 포함합니다.'],
        ['수치는 계속 바뀌나요?', '상영 중인 작품과 KOBIS 보정이 반영되면 순위와 수치가 달라질 수 있습니다.'],
      ],
    };
  },
  'worldwide-box-office-2026': () => {
    const d = worldBox, top = d.rows[0];
    return {
      date: `${dot(d.checkedAt)} 조회`, dataLabel: `Box Office Mojo ${dot(d.checkedAt)} 조회 데이터`, auditDate: dot(d.checkedAt), sourceUrl: d.source,
      description: `올해 개봉작의 전 세계 극장 누적 매출 상위 10편을 비교합니다. 1위는 ${movie(top.title)}(${usd(top.gross)})입니다. 상영 중인 작품은 매출과 순위가 달라질 수 있습니다.`,
      rows: d.rows.map((r) => ({ name: movie(r.title), value: `$${won(r.gross)}`, note: N.movies[r.title] ? r.title : '', rank: r.rank })),
      faq: [
        ['올해 세계 흥행 1위 영화는?', `${md(d.checkedAt)} 조회 기준 ${movie(top.title)}로 $${won(top.gross)}입니다.`],
        ['극장 매출은 순이익인가요?', '아닙니다. 제작·배급·마케팅 비용을 차감하지 않은 매출입니다.'],
      ],
    };
  },
  'spider-man-worldwide-box-office': () => {
    const d = spiderMan, top = d.rows[0];
    return {
      date: `${dot(d.checkedAt)} 조회`, dataLabel: `The Numbers ${dot(d.checkedAt)} 조회 데이터`, auditDate: dot(d.checkedAt),
      description: `실사와 장편 애니메이션을 함께 비교한 스파이더맨 시리즈 세계 흥행 상위 10편입니다. 1위는 ${movie(top.title)}(${usd(top.gross)})입니다. 묶음 상영·미개봉 작품은 제외합니다.`,
      rows: d.rows.map((r) => ({ name: movie(r.title), value: `$${won(r.gross)}`, note: `${r.year ?? ''} · 전 세계 누적 매출`.replace(/^ · /, ''), rank: r.rank })),
      faq: [
        ['가장 흥행한 스파이더맨 영화는?', `${movie(top.title)}입니다. ${md(d.checkedAt)} 조회 기준 전 세계 $${won(top.gross)}입니다.`],
        ['국내 관객 수 순위인가요?', '아니요. 전 세계 극장 매출을 미국 달러로 비교한 순위입니다.'],
        ['애니메이션도 포함되나요?', '뉴 유니버스와 어크로스 더 유니버스 등 개봉한 장편 애니메이션을 포함합니다.'],
      ],
    };
  },
  'korea-car-sales': () => {
    const d = carSales, top = d.rows[0];
    const [y, m] = d.month.split('-').map(Number);
    return {
      date: `${y}년 ${m}월 · ${md(d.checkedAt)} 확인`, dataLabel: `다나와자동차 ${y}년 ${m}월 데이터`, auditDate: dot(d.checkedAt), sourceUrl: d.source,
      description: `${y}년 ${m}월 국산 모델 판매량 상위 10개입니다. 1위는 ${top.brand} ${top.name}(${won(top.sales)}대)입니다. 수입 브랜드와 중고차는 포함하지 않습니다.`,
      rows: d.rows.map((r) => ({ name: r.name, value: `${won(r.sales)}대`, note: r.brand, rank: r.rank, image: r.local ?? r.image, imageSource: r.image })),
      faq: [
        [`${m}월 국산차 판매 1위는 무엇인가요?`, `${top.brand} ${top.name}가 ${won(top.sales)}대로 1위입니다.`],
        ['판매량과 등록 대수는 같나요?', '자료원과 집계 시점에 따라 일부 차이가 날 수 있습니다.'],
        ['수입차도 포함되나요?', '이 표는 국산 모델 순위이며 수입차는 별도 집계입니다.'],
      ],
    };
  },
  'kbo-team-standings-2026': () => {
    const d = kboTeams, [a, b] = d.rows;
    return {
      date: `${dot(d.checkedAt)} 조회`, dataLabel: `KBO ${dot(d.checkedAt)} 조회 데이터`, auditDate: dot(d.checkedAt),
      description: `2026 KBO 정규시즌 팀 순위입니다. ${a.team}가 승률 ${a.pct}로 1위, ${b.team}가 ${b.behind}경기 차 2위입니다. 승·패·무와 1위와의 게임 차를 함께 비교합니다.`,
      rows: d.rows.map((r) => ({ name: r.team, value: `승률 ${r.pct}`, note: `${r.win}승 ${r.loss}패 ${r.draw}무 · 1위와 ${r.behind}경기 차`, rank: r.rank, ...(KBO_LOGO[r.team] ? { image: `/ranking-images/expansion/kbo_${KBO_LOGO[r.team]}.webp`, imageSource: 'https://www.koreabaseball.com/Kbo/League/TeamInfo.aspx' } : {}) })),
      faq: [
        ['현재 1위 팀은 어디인가요?', `${md(d.checkedAt)} 조회 기준 ${a.team}가 승률 ${a.pct}로 1위입니다.`],
        [`${a.team}와 ${b.team}의 차이는 얼마나 되나요?`, `2위 ${b.team}의 승률은 ${b.pct}이며, 1위 ${a.team}과의 차이는 ${b.behind}경기입니다.`],
        ['승수가 더 많은데 순위가 낮을 수 있나요?', 'KBO 정규시즌 순위는 승수만이 아니라 승률을 기준으로 정합니다. 우천 순연 등으로 팀별 경기 수가 다를 수 있습니다.'],
      ],
    };
  },
  'kbo-home-runs-2026': () => hitters(kboHr, '홈런', '홈런'),
  'kbo-rbi-2026': () => hitters(kboRbi, '타점', '타점'),
  'korea-import-car-brands': () => {
    const d = importCars, { y, m } = ym(d.month), top = d.rows[0], brand = (en: string) => N.brands[en] ?? en;
    return {
      date: `${y}년 ${m}월 · ${md(d.checkedAt)} 확인`, dataLabel: `KAIDA ${y}년 ${m}월 데이터`, auditDate: dot(d.checkedAt), source: `한국수입자동차협회(KAIDA) · ${y}년 ${m}월 신규등록`,
      description: `KAIDA가 발표한 ${y}년 ${m}월 수입 승용차 신규등록 ${won(d.total)}대 중 상위 10개 브랜드입니다. 1위는 ${brand(top.brand)}(${won(top.count)}대)입니다. 전기차만의 순위나 전 세계 판매 순위는 아닙니다.`,
      rows: d.rows.map((r) => ({ name: brand(r.brand), value: `${won(r.count)}대`, note: `${m}월 수입 승용차 전체 대비 ${r.share.toFixed(1)}% · 신규등록`, rank: r.rank })),
      faq: [
        ['수입차 1위 브랜드는 어디인가요?', `${y}년 ${m}월 KAIDA 회원사 수입 승용차 신규등록 기준 ${brand(top.brand)}가 ${won(top.count)}대로 1위입니다.`],
        ['등록 대수와 주문·판매 대수는 같은가요?', '아닙니다. 이 표는 신규등록 기준입니다. 주문량, 계약량, 제조사 도매 판매와 시점 및 범위가 다릅니다.'],
        ['점유율은 TOP 10 안에서 계산했나요?', `아니요. ${m}월 전체 수입 승용차 신규등록 ${won(d.total)}대를 기준으로 계산했습니다.`],
      ],
    };
  },
  'kbo-attendance-2026': () => {
    const d = kboCrowd, top = d.rows[0], team = (t: string) => N.kboTeams[t] ?? t;
    return {
      date: `${dot(d.date)} 기준`, dataLabel: `KBO ${dot(d.date)} 데이터`, auditDate: dot(d.checkedAt),
      basis: '구단별 누적 홈 관중 · 2026 정규시즌',
      description: `2026 KBO 정규시즌 구단별 누적 홈 관중입니다. 10개 구단 합계 ${tenK(d.total)} 명이며, ${team(top.team)}가 ${won(top.crowd)}명으로 가장 많습니다.`,
      rows: d.rows.map((r) => ({ name: team(r.team), value: `${won(r.crowd)}명`, note: '', rank: r.rank, ...(KBO_LOGO[r.team] ? { image: `/ranking-images/expansion/kbo_${KBO_LOGO[r.team]}.webp`, imageSource: 'https://www.koreabaseball.com/Kbo/League/TeamInfo.aspx' } : {}) })),
      faq: [
        ['홈 관중이 가장 많은 구단은 어디인가요?', `${md(d.date)} 기준 ${team(top.team)}가 ${won(top.crowd)}명으로 1위입니다.`],
        ['집계된 정규시즌 관중은 몇 명인가요?', `${dot(d.date)} 기준 10개 구단 홈 관중 합계는 ${won(d.total)}명입니다.`],
        ['원정 관중도 포함되나요?', '구단별 홈 경기 관중만 셉니다. 한 경기는 홈 구단에만 집계됩니다.'],
      ],
    };
  },
  'korea-province-population': () => {
    const d = population, { y, m } = ym(d.month), top = d.rows[0];
    return {
      date: `${y}년 ${m}월 말`, dataLabel: `행정안전부 ${y}년 ${m}월 말 데이터`, auditDate: dot(d.checkedAt),
      basis: `${y}년 ${m}월 말 주민등록 총인구 · 외국인 제외`,
      description: `행정안전부 주민등록 총인구 기준 상위 10개 시도입니다. ${y}년 ${m}월 말 전국 인구는 ${won(d.total)}명이며, ${top.name}가 ${won(top.population)}명으로 가장 많습니다. 거주자·거주불명자·재외국민을 포함하고 외국인은 제외합니다.`,
      rows: d.rows.map((r) => ({ name: r.name, value: `${won(r.population)}명`, note: '', rank: r.rank })),
      faq: [
        ['인구가 가장 많은 시도는?', `${y}년 ${m}월 말 기준 ${top.name}로 ${won(top.population)}명입니다.`],
        ['외국인도 포함되나요?', '이 표의 주민등록 인구에는 외국인이 포함되지 않습니다.'],
        ['언제 갱신되나요?', '매주 수·토요일에 새 월간 자료를 확인합니다. 수집과 검증이 성공하면 반영하며, 새 자료가 없으면 기존 기준월을 유지합니다.'],
      ],
    };
  },
  'christopher-nolan-korea-box-office': (p) => {
    const kobis = new Map([...admissions.rows, ...boxOffice.rows].map((r) => [r.title, r.audience]));
    const at = dot(boxOffice.checkedAt);
    const rows = p.rows.map((r) => (kobis.has(r.name) ? { ...r, value: `${won(kobis.get(r.name)!)}명`, note: `KOBIS 누적 집계 · ${at} 조회` } : r))
      .sort((a, b) => people(b.value) - people(a.value)).map((r, i) => ({ ...r, rank: i + 1 }));
    return { rows, date: `${at} 자료 확인`, dataLabel: `KOBIS·흥행 보도 ${at} 데이터`, auditDate: at };
  },
  'ufc-rankings-by-division': () => {
    const d = ufc;
    const divisions: Division[] = d.divisions.map((x) => ({ name: UFC_KO[x.division], limit: UFC_LIMIT[x.division], champion: person(x.champion), contenders: x.contenders.map(person) }));
    const p4p = ((d as { p4p?: string[] }).p4p ?? []).map(person);
    return {
      date: `${dot(d.checkedAt)} 확인`, dataLabel: `UFC ${dot(d.checkedAt)} 조회 데이터`, auditDate: dot(d.checkedAt), divisions, p4p,
      description: 'UFC 남성부 8개 체급의 챔피언과 랭킹 1~3위, 체급과 상관없는 P4P 순위입니다.',
      rows: divisions.map((x) => ({ name: x.champion, value: `${x.name} 챔피언`, note: '' })),
      faq: [
        ['UFC 랭킹은 누가 정하나요?', 'UFC가 선정한 미디어 패널의 투표로 정합니다.'],
        ['챔피언도 1위에 포함되나요?', '아니요. 챔피언은 따로 두고, 그 아래부터 1위가 시작됩니다.'],
        ['P4P는 무엇인가요?', '체급 차이를 빼고 선수의 종합 기량을 비교한 순위입니다.'],
      ],
    };
  },
};
const UFC_LIMIT: Record<string, string> = { Flyweight: '56.7kg', Bantamweight: '61.2kg', Featherweight: '65.8kg', Lightweight: '70.3kg', Welterweight: '77.1kg', Middleweight: '83.9kg', 'Light Heavyweight': '93.0kg', Heavyweight: '120.2kg' };
const UFC_KO: Record<string, string> = { Flyweight: '플라이급', Bantamweight: '밴텀급', Featherweight: '페더급', Lightweight: '라이트급', Welterweight: '웰터급', Middleweight: '미들급', 'Light Heavyweight': '라이트헤비급', Heavyweight: '헤비급' };

function hitters(d: typeof kboHr, label: string, unit: string): Live {
  const rows: RankingRow[] = d.rows.map((r) => ({ name: N.kboPlayers[r.playerId] ?? r.name, value: `${r.value}${unit}`, note: r.team, rank: r.rank }));
  const top = rows[0];
  return {
    date: `${dot(d.checkedAt)} 조회`, dataLabel: `KBO ${dot(d.checkedAt)} 조회 데이터`, auditDate: dot(d.checkedAt), rows,
    description: `2026 KBO 정규시즌 ${label} 기록 상위 10명입니다. ${top.name}(${top.note})이 ${top.value}로 1위입니다. 동률은 공동 순위이며, 10번째에서 동률이 이어지면 공식 표의 순서로 10명까지 보여줍니다.`,
    faq: [
      [`${label} 1위는 누구인가요?`, `${md(d.checkedAt)} 조회 기준 ${top.name}(${top.note})으로 ${top.value}입니다.`],
      ['포스트시즌도 포함하나요?', '정규시즌 기록만 비교합니다.'],
      ['공동 10위가 여러 명이면 어떻게 표시하나요?', '최대 10명까지 노출하며 공식 기록표의 표시 순서를 따릅니다.'],
    ],
  };
}

const IMAGES = liveImages as Record<string, { image: string; source?: string }>;

export function applyLive(pages: RankingPage[]): RankingPage[] {
  return pages.map((p) => {
    const build = BUILDERS[p.slug];
    if (!build) return p;
    const live = build(p);
    const rowSource = p.rows[0]?.sourceUrl ? { sourceUrl: live.sourceUrl ?? p.sourceUrl } : {};
    const rows = live.rows?.map((r) => { const known = IMAGES[r.name]; return { ...r, ...(known ? { image: known.image, imageSource: known.source } : {}), ...rowSource }; });
    return { ...p, ...live, ...(rows ? { rows } : {}) };
  });
}

export const LIVE_SLUGS = Object.keys(BUILDERS);
