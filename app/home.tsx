"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HomeRanking } from "./home-ranking";
import { dateParts } from "./rankings/date-parts";
import { BrandLogo } from "./brand-logo";
import { TrendRoll } from "./trend-roll";
import { RankingTicker } from "./ranking-ticker";
import { FRESHNESS } from "./rankings/freshness";
import type { TrendPick } from "../lib/trends";

type Category = "전체" | "스포츠" | "미디어" | "라이프" | "IT·게임" | "글로벌";

const categories: Category[] = ["전체", "스포츠", "미디어", "라이프", "IT·게임", "글로벌"];

const TROPHY_COLORS = [["#ffd45a", "#e3a300"], ["#d9dee6", "#9aa4b2"], ["#f0b07a", "#c06a2b"]];
function Trophy({ rank }: { rank: number }) {
  const [from, to] = TROPHY_COLORS[rank];
  const fill = `url(#hero-trophy-${rank})`;
  return <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <defs><linearGradient id={`hero-trophy-${rank}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={from} /><stop offset="1" stopColor={to} /></linearGradient></defs>
    <path d="M7 5H4.5v1.5A3.5 3.5 0 0 0 8 10M17 5h2.5v1.5A3.5 3.5 0 0 1 16 10" fill="none" stroke={fill} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M6.5 3h11v5.5a5.5 5.5 0 0 1-11 0Z" fill={fill} />
    <rect x="10.9" y="13.5" width="2.2" height="3.5" fill={fill} />
    <rect x="7.5" y="17" width="9" height="3" rx="1" fill={fill} />
  </svg>;
}

const heroQuestions = [
  { icon: "⚾️", question: "아시안게임 야구 최다 우승국은?", slug: "asian-games-baseball-champions" },
  { icon: "🍿", question: "이번 주 넷플릭스 영화 1위는?", slug: "netflix-korea-films-weekly" },
  { icon: "🚗", question: "가장 많이 팔린 수입차 브랜드는?", slug: "korea-import-car-brands" },
  { icon: "🎬", question: "올해 극장 관객 1위 영화는?", slug: "korea-box-office-2026" },
  { icon: "🐉", question: "전 세계에서 가장 인기 있는 애니는?", slug: "anime-all-time-popular" },
  { icon: "🏟️", question: "올해 홈 관중이 가장 많은 구단은?", slug: "kbo-attendance-2026" },
  { icon: "🎮", question: "PC방에서 가장 많이 하는 게임은?", slug: "korea-pc-games-share" },
  { icon: "🏙️", question: "세계에서 가장 높은 빌딩은?", slug: "world-tallest-buildings" },
  { icon: "💸", question: "가장 많이 번 스포츠 스타는?", slug: "highest-paid-athletes" },
];
const HERO_SETS = Math.ceil(heroQuestions.length / 3);

const rankings = [
  { category: "스포츠", icon: "🏆", title: "역대 아시안게임 야구 우승 국가 순위", color: "blue" },
  { category: "스포츠", icon: "🏅", title: "2026 아시안게임 국가별 메달 순위", color: "gold" },
  { category: "IT·게임", icon: "💾", title: "파일 공유 서비스 비교", color: "indigo" },
  { category: "IT·게임", icon: "🎮", title: "국내 인기 모바일 게임 순위", color: "purple" },
  { category: "IT·게임", icon: "🖥️", title: "국내 인기 PC 게임 순위", color: "navy" },
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
  { category: "스포츠", icon: "⚽️", title: "한국 축구선수 연봉", color: "green" },
  { category: "미디어", icon: "🌏", title: "2026년 세계 영화 흥행", color: "purple" },
  { category: "스포츠", icon: "💵", title: "MLB 한국 선수 역대 연봉", color: "blue" },
  { category: "스포츠", icon: "🥊", title: "UFC 체급별 랭킹", color: "red" },
  { category: "미디어", icon: "🎥", title: "역대 국내 영화 관객", color: "purple" },
  { category: "미디어", icon: "🎭", title: "역대 드라마 시청률", color: "orange" },
  { category: "미디어", icon: "🐉", title: "역대 인기 애니메이션 순위", color: "purple" },
  { category: "미디어", icon: "📺", title: "이번 시즌 인기 애니메이션 순위", color: "rose" },
  { category: "미디어", icon: "💿", title: "역대 가수 음반 판매량 순위", color: "indigo" },
  { category: "라이프", icon: "🧳", title: "한국인이 찾는 여행지", color: "cyan" },
  { category: "IT·게임", icon: "📱", title: "국내 OTT 서비스", color: "black" },
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

const ADULT = new Set(["japan-av-actress-ranking"]);

function updatedLabel(slug: string, pageBySlug: Record<string, HomeRanking>) {
  const p = pageBySlug[slug];
  const f = FRESHNESS[slug];
  if (f?.kind === "fixed") return "변동 없음";
  const updated = p && dateParts(p.date, p.auditDate).updated;
  return updated ? `${updated.slice(5)} ${f?.kind === "auto" ? "갱신" : "확인"}` : "";
}

function cycleText(slug: string) {
  const f = FRESHNESS[slug];
  if (!f || f.kind === "fixed") return null;
  return <span><em>{f.cycle}</em> 갱신</span>;
}

const topic = (title: string) => title.replace(/\s*·\s*\d{4}년 \d+월$/, "").replace(/^(2026년?|이번 주)\s+/, "").replace(/\s*TOP \d+$/, "").replace(/\s*순위$/, "");

function hotRankings(day: string, pages: HomeRanking[], slugByTitle: Record<string, string>, count = 5) {
  const listed = new Set(Object.values(slugByTitle));
  const pool = pages.filter((p) => !p.noindex && !p.unranked && listed.has(p.slug)).map((p) => p.slug).sort();
  let seed = [...day].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261) >>> 0;
  const random = () => { seed = (seed + 0x6d2b79f5) >>> 0; let t = seed; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, count);
}

const upcoming = ["프로야구 선수 연봉", "KBO 통산 홈런", "KBO 통산 투수승", "유튜버 구독자", "유튜버 추정 수입", "아파트 실거래가", "국내 대학 입결", "직업별 평균 연봉", "게임 매출", "모바일 앱 사용자", "치킨 브랜드 매장 수", "커피 프랜차이즈 매장 수", "편의점 매출", "항공사 이용객", "세계 축구클럽 가치", "역대 예능 시청률", "음원 스트리밍", "아이돌 앨범 판매", "웹툰 인기", "배달앱 사용자", "전기차 판매", "국내 캠핑장 인기", "반려견 품종", "세계 공항 이용객"];

export default function Home({ picks, trendsAt, hotDay, pages, slugByTitle }: { picks: TrendPick[]; trendsAt?: string; hotDay: string; pages: HomeRanking[]; slugByTitle: Record<string, string> }) {
  const pageBySlug = useMemo(() => Object.fromEntries(pages.map(p => [p.slug, p])), [pages]);
  const [active, setActive] = useState<Category>("전체");
  const [query, setQuery] = useState("");
  const heroRef = useRef<HTMLElement>(null);
  const [heroVisible, setHeroVisible] = useState(true);
  const [heroSet, setHeroSet] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  useEffect(() => {
    if (heroPaused || !heroVisible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setHeroSet((n) => (n + 1) % HERO_SETS), 5000);
    return () => clearInterval(timer);
  }, [heroPaused, heroVisible]);
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setHeroVisible(entry.isIntersecting));
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);
  const filtered = useMemo(() => rankings.filter((item) =>
    pageBySlug[slugByTitle[item.title]] && !pageBySlug[slugByTitle[item.title]].noindex && (active === "전체" || item.category === active) &&
    (item.title + (pageBySlug[slugByTitle[item.title]]?.title ?? "") + (pageBySlug[slugByTitle[item.title]]?.rows.map(row => row.name).join(" ") ?? "")).toLowerCase().includes(query.toLowerCase())
  ), [active, query, pageBySlug, slugByTitle]);

  return (
    <main>
      <header className="site-header">
        <div className="header-inner">
          <BrandLogo />
          <label className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="궁금한 순위를 검색하세요" /></label>
        </div>
      </header>

      <section className="hero" id="top" ref={heroRef}>
        <div className="hero-copy">
          <p className="eyebrow">대한민국 모든 순위를 한곳에</p>
          <h1>지금 사람들이<br/><em>가장 궁금한 순위</em></h1>
          <p className="hero-desc">스포츠부터 영화·자동차·OTT까지, 한눈에 비교하세요.</p>
          <div className="hero-actions"><a href="#rankings" onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const target = document.getElementById("rankings");
            if (!target) return;
            event.preventDefault();
            target.focus({ preventScroll: true });
            target.scrollIntoView({ behavior: "instant", block: "start" });
          }}>순위 둘러보기 <b>→</b></a></div>
        </div>
        <div className="hero-board" aria-label="궁금한 순위" onMouseEnter={() => setHeroPaused(true)} onMouseLeave={() => setHeroPaused(false)} onFocus={() => setHeroPaused(true)} onBlur={() => setHeroPaused(false)}>
          {heroQuestions.slice(heroSet * 3, heroSet * 3 + 3).map((item, i) => {
            
            return <a href={`/rankings/${item.slug}`} className="hero-row" key={`${heroSet}-${item.slug}`} style={{ animationDelay: `${i * 90}ms` }}>
              <b className="hero-trophy" aria-label={`${i + 1}위`}><Trophy rank={i} /></b>
              <div className="avatar ranking-thumbnail" aria-hidden="true">{item.icon}</div>
              <p><strong style={{ whiteSpace: "normal", lineHeight: 1.5 }}>{item.question}</strong></p>
              <i className="hero-go" aria-hidden="true">→</i>
            </a>;
          })}
          <div className="hero-dots" role="tablist" aria-label="질문 묶음">{Array.from({ length: HERO_SETS }, (_, n) => <button key={n} type="button" role="tab" aria-selected={n === heroSet} aria-label={`${n + 1}번째 질문 묶음`} className={n === heroSet ? "on" : ""} onClick={() => setHeroSet(n)}><span key={n === heroSet ? `run-${heroSet}` : "idle"} className={heroPaused ? "paused" : ""} /></button>)}</div>
        </div>
      </section>

      <section className="ticker"><div><b>HOT</b><strong>이번 주 주목할 랭킹</strong>
        <RankingTicker>{[0, 1, 2, 3].map((copy) => hotRankings(hotDay, pages, slugByTitle).map((slug) => <a key={`${copy}-${slug}`} href={`/rankings/${slug}`} aria-hidden={copy > 0 || undefined} tabIndex={copy > 0 ? -1 : undefined}>{topic(pageBySlug[slug].title)} <em>순위 보기 →</em></a>))}</RankingTicker>
      </div></section>

      <section className="content" id="rankings" tabIndex={-1}>
        <div className="section-heading"><div><h2>분야별 인기 순위</h2></div></div>
        <div className="tabs" role="tablist">{categories.map((cat) => <button role="tab" aria-selected={active===cat} className={active===cat?"active":""} key={cat} onClick={()=>setActive(cat)}>{cat}</button>)}</div>
        <div className="layout">
          <div className="card-grid">
            {filtered.map((item) => { const slug = slugByTitle[item.title]; return <article className="rank-card" key={item.title}>
              <div className={`icon ${item.color}`}>{item.icon}</div><span className="badge">{updatedLabel(slug, pageBySlug)}</span>
              <small>{item.category}{ADULT.has(slug) && " · 19+"}</small><h3>{pageBySlug[slug]?.title||item.title}</h3>
              <p className="rank-lead">{pageBySlug[slug]?.rows.length}개 항목</p>
              <a className="rank-link" href={`/rankings/${slug}`}>{cycleText(slug)}<i>자세히 <b>→</b></i></a>
            </article>; })}
            {!filtered.length && <div className="empty">검색 결과가 없습니다. 다른 키워드를 입력해 보세요.</div>}
          </div>
          <aside>
            <div className="aside-title"><div><span>↗</span><p><small>{trendsAt ? `${trendsAt.split(" ").slice(0, 2).join(" ")} 실시간 검색어` : "오늘의 추천"}</small><strong>지금 주목할 랭킹</strong></p></div><em className="hot">급상승</em></div>
            <TrendRoll picks={picks}/>
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
