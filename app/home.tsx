"use client";

import { useEffect, useMemo, useState } from "react";
import { slugByTitle, pageBySlug, pages } from "./rankings/data";
import { dateParts } from "./rankings/date-parts";
import { BrandLogo } from "./brand-logo";
import { FlapText } from "./flap-text";
import type { TrendPick } from "../lib/trends";

type Category = "전체" | "스포츠" | "미디어" | "라이프" | "서비스" | "글로벌";

const categories: Category[] = ["전체", "스포츠", "미디어", "라이프", "서비스", "글로벌"];

const heroQuestions = [
  { icon: "🏆", question: "아시안게임 야구 최다 우승국은?", slug: "asian-games-baseball-champions" },
  { icon: "🍿", question: "이번 주 넷플릭스 영화 1위는?", slug: "netflix-korea-films-weekly" },
  { icon: "🚗", question: "가장 많이 팔린 수입차 브랜드는?", slug: "korea-import-car-brands" },
];

const rankings = [
  { category: "스포츠", icon: "🏆", title: "역대 아시안게임 야구 우승 국가 순위", color: "blue" },
  { category: "스포츠", icon: "🏅", title: "2026 아시안게임 국가별 메달 순위", color: "gold" },
  { category: "서비스", icon: "💾", title: "파일 공유 서비스 비교", color: "indigo" },
  { category: "서비스", icon: "🎮", title: "국내 인기 모바일 게임 순위", color: "purple" },
  { category: "서비스", icon: "🖥️", title: "국내 인기 PC 게임 순위", color: "navy" },
  { category: "미디어", icon: "🍿", title: "이번 주 넷플릭스 영화 TOP 10", color: "red" },
  { category: "미디어", icon: "🎬", title: "2026년 국내 영화 흥행", color: "red" },
  { category: "스포츠", icon: "🏟️", title: "2026 KBO 팀 순위", color: "blue" },
  { category: "스포츠", icon: "💥", title: "2026 KBO 홈런 순위 TOP 10", color: "blue" },
  { category: "라이프", icon: "🚗", title: "수입차 브랜드 등록 순위 TOP 10", color: "navy" },
  { category: "스포츠", icon: "🎯", title: "2026 KBO 타점 순위 TOP 10", color: "green" },
  { category: "스포츠", icon: "👑", title: "KBO 역대 한 시즌 홈런 TOP 10", color: "blue" },
  { category: "미디어", icon: "🎞️", title: "크리스토퍼 놀란 영화 국내 흥행 순위", color: "purple" },
  { category: "미디어", icon: "🕷️", title: "역대 스파이더맨 영화 흥행 순위", color: "red" },
  { category: "스포츠", icon: "🎟️", title: "2026 KBO 구단 관중", color: "blue" },
  { category: "미디어", icon: "📺", title: "OTT 인기 콘텐츠", color: "pink" },
  { category: "라이프", icon: "🚙", title: "국내 자동차 판매량", color: "navy" },
  { category: "스포츠", icon: "⚽", title: "한국 축구선수 연봉", color: "green" },
  { category: "미디어", icon: "🌏", title: "2026년 세계 영화 흥행", color: "purple" },
  { category: "스포츠", icon: "💵", title: "MLB 한국 선수 역대 연봉", color: "blue" },
  { category: "스포츠", icon: "🥊", title: "UFC 체급별 랭킹", color: "red" },
  { category: "미디어", icon: "🎥", title: "역대 국내 영화 관객", color: "purple" },
  { category: "미디어", icon: "🎭", title: "역대 드라마 시청률", color: "orange" },
  { category: "라이프", icon: "🧳", title: "한국인이 찾는 여행지", color: "cyan" },
  { category: "서비스", icon: "📱", title: "국내 OTT 서비스", color: "black" },
  { category: "글로벌", icon: "🎌", title: "일본 AV 배우 인기", color: "rose" },
  { category: "글로벌", icon: "💸", title: "세계 스포츠 스타 수입", color: "gold" },
  { category: "글로벌", icon: "🏙️", title: "세계 최고층 빌딩", color: "blue" },
  { category: "글로벌", icon: "🌍", title: "세계 인구", color: "green" },
  { category: "라이프", icon: "👥", title: "대한민국 시도 인구", color: "orange" },
  { category: "라이프", icon: "⛰️", title: "대한민국 높은 산", color: "cyan" },
  { category: "글로벌", icon: "💰", title: "세계 GDP", color: "gold" },
  { category: "글로벌", icon: "🗺️", title: "세계에서 가장 큰 나라", color: "green" },
  { category: "글로벌", icon: "🏔️", title: "세계에서 가장 높은 산", color: "navy" },
  { category: "라이프", icon: "✈️", title: "세계 관광객 방문 국가", color: "purple" },
];


// 카드 아래 줄: 이 순위가 얼마나 자주 업데이트되는지. 없으면 "기록 경신 때"입니다.
const CYCLE: Record<string, string> = {
  "netflix-korea-films-weekly": "매주", "ott-content-weekly": "매주", "ufc-rankings-by-division": "매주",
  "file-sharing-services": "2일마다",
  "kbo-team-standings-2026": "시즌 중", "kbo-home-runs-2026": "시즌 중", "kbo-rbi-2026": "시즌 중", "kbo-attendance-2026": "시즌 중",
  "asian-games-medal-table-2026": "대회 때",
  "korea-import-car-brands": "매월", "korea-mobile-games-users": "매월", "korea-pc-games-share": "매월", "korea-car-sales": "매월", "korea-province-population": "매월", "korean-travel-destinations": "매월", "korea-ott-users": "매월", "japan-av-actress-ranking": "매월",
  "korea-box-office-2026": "매년", "worldwide-box-office-2026": "매년", "highest-paid-athletes": "매년", "world-population": "매년", "world-gdp-ranking": "매년", "most-visited-countries": "매년", "korean-football-salary": "매년",
};
const ADULT = new Set(["japan-av-actress-ranking"]);

/** 카드 오른쪽 위 라벨: "09.17 갱신". 상세 화면 "업데이트"와 같은 날짜입니다. */
function updatedLabel(slug: string) {
  const p = pageBySlug[slug];
  const updated = p && dateParts(p.date, p.auditDate).updated;
  return updated ? `${updated.slice(5)} 갱신` : "";
}

/** HOT 띠에 쓰는 짧은 순위 이름: "2026 KBO 팀 순위" → "KBO 팀" */
const topic = (title: string) => title.replace(/^(2026년?|이번 주)\s+/, "").replace(/\s*TOP \d+$/, "").replace(/\s*순위$/, "");

/** HOT 띠: 지금 실시간 검색어와 이어진 순위를 먼저, 나머지는 자료가 최근에 바뀐 순위로 채웁니다. */
function hotRankings(trendSlugs: string[], count = 4) {
  const listed = new Set(Object.values(slugByTitle));
  const recent = pages.filter((p) => !p.noindex && !p.unranked && listed.has(p.slug))
    .map((p) => ({ slug: p.slug, updated: dateParts(p.date, p.auditDate).updated ?? "" }))
    .sort((a, b) => b.updated.localeCompare(a.updated)).map((p) => p.slug);
  return [...new Set([...trendSlugs.filter((s) => pageBySlug[s] && !pageBySlug[s].noindex && !pageBySlug[s].unranked && listed.has(s)), ...recent])].slice(0, count);
}


const upcoming = ["프로야구 선수 연봉", "KBO 통산 홈런", "KBO 통산 투수승", "유튜버 구독자", "유튜버 추정 수입", "아파트 실거래가", "국내 대학 입결", "직업별 평균 연봉", "게임 매출", "모바일 앱 사용자", "치킨 브랜드 매장 수", "커피 프랜차이즈 매장 수", "편의점 매출", "항공사 이용객", "세계 축구클럽 가치", "역대 예능 시청률", "음원 스트리밍", "아이돌 앨범 판매", "웹툰 인기", "배달앱 사용자", "전기차 판매", "국내 캠핑장 인기", "반려견 품종", "세계 공항 이용객"];


export default function Home({ picks, trendsAt, trendSlugs = [] }: { picks: TrendPick[]; trendsAt?: string; trendSlugs?: string[] }) {
  const [active, setActive] = useState<Category>("전체");
  const [query, setQuery] = useState("");
  // "지금 주목할 랭킹" 제목 글자를 실시간 검색어판처럼 몇 초마다 위에서부터 한 장씩 넘겨 다시 보여줍니다.
  const [flip, setFlip] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setFlip((n) => n + 1), 6000);
    return () => clearInterval(timer);
  }, []);
  const filtered = useMemo(() => rankings.filter((item) =>
    !pageBySlug[slugByTitle[item.title]]?.noindex && (active === "전체" || item.category === active) &&
    (item.title + (pageBySlug[slugByTitle[item.title]]?.title ?? "") + (pageBySlug[slugByTitle[item.title]]?.rows.map(row => row.name).join(" ") ?? "")).toLowerCase().includes(query.toLowerCase())
  ), [active, query]);

  return (
    <main>
      <header className="site-header">
        <div className="header-inner">
          <BrandLogo />
          <label className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="궁금한 순위를 검색하세요" /></label>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">대한민국 모든 순위를 한곳에</p>
          <h1>지금 사람들이<br/><em>가장 궁금한 순위</em></h1>
          <p className="hero-desc">스포츠 기록부터 영화, 자동차, OTT까지.{" "}<br/>찾기 어려웠던 흥미로운 데이터를 보기 쉽게 모았습니다.</p>
          <div className="hero-actions"><a href="#rankings">순위 둘러보기 <b>→</b></a></div>
        </div>
        <div className="hero-board" aria-label="궁금한 순위 세 가지">
          {heroQuestions.map((item, i) => {
            const page = pageBySlug[item.slug];
            return <a href={`/rankings/${item.slug}`} className="hero-row" key={item.slug}>
              <b>{i + 1}</b>
              <div className="avatar ranking-thumbnail" aria-hidden="true">{item.icon}</div>
              <p><strong style={{ whiteSpace: "normal", lineHeight: 1.5 }}>{item.question}</strong><small>{page.title}</small></p>
            </a>;
          })}

        </div>
      </section>

      <section className="ticker"><div><b>HOT</b><strong>이번 주 주목할 랭킹</strong>{hotRankings(trendSlugs).map((slug)=><a key={slug} href={`/rankings/${slug}`}>{topic(pageBySlug[slug].title)} <em>순위 보기 →</em></a>)}</div></section>

      <section className="content" id="rankings">
        <div className="section-heading"><div><p>EXPLORE RANKINGS</p><h2>분야별 인기 순위</h2></div></div>
        <div className="tabs" role="tablist">{categories.map((cat) => <button role="tab" aria-selected={active===cat} className={active===cat?"active":""} key={cat} onClick={()=>setActive(cat)}>{cat}</button>)}</div>
        <div className="layout">
          <div className="card-grid">
            {filtered.map((item) => { const slug = slugByTitle[item.title]; return <article className="rank-card" key={item.title}>
              <div className={`icon ${item.color}`}>{item.icon}</div><span className="badge">{updatedLabel(slug)}</span>
              <small>{item.category}{ADULT.has(slug) && " · 19+"}</small><h3>{pageBySlug[slug]?.title||item.title}</h3>
              <p className="rank-lead">{pageBySlug[slug]?.rows.length}개 항목을 한눈에 비교해 보세요</p>
              <a className="rank-link" href={`/rankings/${slug}`}><span><em>{CYCLE[slug] ?? "기록 경신 때"}</em> 업데이트돼요</span>자세히 <b>→</b></a>
            </article>; })}
            {!filtered.length && <div className="empty">검색 결과가 없습니다. 다른 키워드를 입력해 보세요.</div>}
          </div>
          <aside>
            <div className="aside-title"><div><span>↗</span><p><small>{trendsAt ? `${trendsAt.split(" ").slice(0, 2).join(" ")} 실시간 검색어` : "오늘의 추천"}</small><strong>지금 주목할 랭킹</strong></p></div><em className="hot">급상승</em><span className="aside-sub">실시간으로 가장 검색이 많이 되고 있어요</span></div>
            <div className="trend-list">{picks.map((item,i)=><a className="trend" href={item.href} target={item.external?"_blank":undefined} rel={item.external?"noreferrer":undefined} key={item.title}><b>{i+1}</b><p><strong><FlapText text={item.title} delay={i*140} run={flip}/></strong><small>{item.subtitle}</small></p>{item.label!=="급상승"&&<em className="up">{item.label}</em>}</a>)}</div>
            <p className="aside-source">{trendsAt ? <>출처 <a href="https://trends.google.co.kr/trending?geo=KR" target="_blank" rel="noreferrer">구글 트렌드</a> · <a href="https://namu.wiki/" target="_blank" rel="noreferrer">나무위키</a> 실시간 검색어 · {trendsAt} 기준</> : "출처 순위ZIP 편집 선정"}</p>
          </aside>
        </div>
      </section>

      <section className="upcoming-section">
        <div className="section-heading"><div><p>NEXT RANKINGS</p><h2>추가하면 재미있는 순위</h2></div><span>검색 관심도와 확장성을 기준으로 골랐어요</span></div>
        <div className="idea-chips">{upcoming.map((x,i)=><span key={x}><b>{String(i+1).padStart(2,"0")}</b>{x}</span>)}</div>
      </section>

      <section className="suggest"><div><span>＋</span><p><small>찾는 순위가 없나요?</small><strong>궁금한 순위를 제안해 주세요</strong></p></div><button>랭킹 제안하기 →</button></section>
      <footer><BrandLogo footer /><p>세상의 흥미로운 순위를 한곳에.</p><small>순위는 공개 자료와 자체 기준을 바탕으로 제공되며, 제휴 콘텐츠는 별도로 표시합니다.</small></footer>
    </main>
  );
}
