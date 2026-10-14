"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HomeRanking } from "./home-ranking";
import { dateParts } from "./rankings/date-parts";
import { BrandLogo } from "./brand-logo";
import { TrendRoll } from "./trend-roll";
import { Medal } from "./medal";
import { catalog as rankings, PINNED_THIRD } from "./rankings/catalog";
import { SearchBox, norm } from "./search-box";
import { SUGGEST_FORM } from "./links";
import { RankingTicker } from "./ranking-ticker";
import { FRESHNESS } from "./rankings/freshness";
import type { TrendPick } from "../lib/trends";

type Category = "전체" | "스포츠" | "미디어" | "라이프" | "IT·게임" | "글로벌";

const categories: Category[] = ["전체", "스포츠", "미디어", "라이프", "IT·게임", "글로벌"];


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
  const filtered = useMemo(() => {
    const shown = (item: typeof rankings[number]) => pageBySlug[slugByTitle[item.title]] && !pageBySlug[slugByTitle[item.title]].noindex;
    const list = rankings.filter((item) => shown(item) && (active === "전체" || item.category === active) &&
      norm(item.title + (pageBySlug[slugByTitle[item.title]]?.title ?? "") + (pageBySlug[slugByTitle[item.title]]?.rows.map(row => row.name).join(" ") ?? "")).includes(norm(query)));
    const pin = rankings.find((item) => item.title === PINNED_THIRD);
    if (norm(query) || !pin || !shown(pin)) return list;
    const rest = list.filter((item) => item !== pin);
    return [...rest.slice(0, 2), pin, ...rest.slice(2)];
  }, [active, query, pageBySlug, slugByTitle]);

  const searchItems = useMemo(() => rankings.flatMap((item) => {
    const page = pageBySlug[slugByTitle[item.title]];
    return page && !page.noindex ? [{ slug: page.slug, title: page.title, category: item.category, icon: item.icon, color: item.color, rows: page.rows.map((r) => r.name) }] : [];
  }), [pageBySlug, slugByTitle]);

  return (
    <main>
      <header className="site-header">
        <div className="header-inner">
          <BrandLogo />
          <SearchBox items={searchItems} query={query} onQuery={setQuery} />
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
            
            return <a href={`/rankings/${item.slug}/`} className="hero-row" key={`${heroSet}-${item.slug}`} style={{ animationDelay: `${i * 90}ms` }}>
              <b className="hero-trophy" aria-label={`${i + 1}위`}><Medal rank={i + 1} size={30} /></b>
              <div className="avatar ranking-thumbnail" aria-hidden="true">{item.icon}</div>
              <p><strong style={{ whiteSpace: "normal", lineHeight: 1.5 }}>{item.question}</strong></p>
              <i className="hero-go" aria-hidden="true">→</i>
            </a>;
          })}
          <div className="hero-dots" role="tablist" aria-label="질문 묶음">{Array.from({ length: HERO_SETS }, (_, n) => <button key={n} type="button" role="tab" aria-selected={n === heroSet} aria-label={`${n + 1}번째 질문 묶음`} className={n === heroSet ? "on" : ""} onClick={() => setHeroSet(n)}><span key={n === heroSet ? `run-${heroSet}` : "idle"} className={heroPaused ? "paused" : ""} /></button>)}</div>
        </div>
      </section>

      <section className="ticker"><div><b>HOT</b><strong>이번 주 주목할 랭킹</strong>
        <RankingTicker>{[0, 1, 2, 3].map((copy) => hotRankings(hotDay, pages, slugByTitle).map((slug) => <a key={`${copy}-${slug}`} href={`/rankings/${slug}/`} aria-hidden={copy > 0 || undefined} tabIndex={copy > 0 ? -1 : undefined}>{topic(pageBySlug[slug].title)} <em>순위 보기 →</em></a>))}</RankingTicker>
      </div></section>

      <section className="content" id="rankings" tabIndex={-1}>
        <div className="section-heading"><div><h2>분야별 인기 순위</h2></div></div>
        <div className="tabs" role="tablist">{categories.map((cat) => <button role="tab" aria-selected={active===cat} className={active===cat?"active":""} key={cat} onClick={()=>setActive(cat)}>{cat}</button>)}</div>
        <div className="layout">
          <div className="card-grid">
            {filtered.map((item) => { const slug = slugByTitle[item.title]; return <article className={`rank-card t-${item.color}`} key={item.title}>
              <div className={`icon ${item.color}`}>{item.icon}</div><span className="badge">{updatedLabel(slug, pageBySlug)}</span>
              <small>{item.category}{ADULT.has(slug) && " · 19+"}</small><h3>{pageBySlug[slug]?.title||item.title}</h3>
              <p className="rank-lead">{pageBySlug[slug]?.rows.length}개 항목</p>
              <a className="rank-link" href={`/rankings/${slug}/`}>{cycleText(slug)}<i>자세히 <b>→</b></i></a>
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

      <section className="suggest"><div><span>＋</span><p><small>찾는 순위가 없나요?</small><strong>궁금한 순위를 제안해 주세요</strong></p></div><a href={SUGGEST_FORM} target="_blank" rel="noreferrer">랭킹 제안하기 →</a></section>
      <footer><BrandLogo footer /><p>세상의 흥미로운 순위를 한곳에.</p><small>순위는 공개 자료와 자체 기준을 바탕으로 제공되며, 제휴 콘텐츠는 별도로 표시합니다.</small></footer>
    </main>
  );
}
