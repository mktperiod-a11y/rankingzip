"use client";

import { useMemo, useState } from "react";
import { slugByTitle, pageBySlug } from "./rankings/data";

type Category = "전체" | "스포츠" | "미디어" | "라이프" | "서비스" | "글로벌";

const categories: Category[] = ["전체", "스포츠", "미디어", "라이프", "서비스", "글로벌"];

const rankings = [
  { category: "스포츠", icon: "⚾", title: "역대 아시안게임 야구 우승 국가 순위", desc: "한국 통산 7회 우승·대회 5연패", tag: "9.27", color: "blue" },
  { category: "스포츠", icon: "🏅", title: "2026 아시안게임 국가별 메달 순위", desc: "한국 금 8·은 8·동 25개로 종합 3위", tag: "9.23", color: "gold" },
  { category: "서비스", icon: "☁", title: "파일 공유 서비스 비교", desc: "온디스크·케이디스크 등 이용 전 비교", tag: "서비스 비교", color: "indigo" },
  { category: "미디어", icon: "▶", title: "이번 주 넷플릭스 영화 TOP 10", desc: "9월 14~20일 · The Warriors 1위", tag: "주간", color: "red" },
  { category: "미디어", icon: "🎟", title: "2026년 국내 영화 흥행", desc: "오디세이 1,002만·스파이더맨 879만", tag: "9.7", color: "red" },
  { category: "스포츠", icon: "⚾", title: "2026 KBO 팀 순위", desc: "KT 7연승 단독 1위·삼성과 2.5경기", tag: "9.17", color: "blue" },
  { category: "스포츠", icon: "⚾", title: "2026 KBO 홈런 순위 TOP 5", desc: "김도영 40·오스틴 39·힐리어드 36홈런", tag: "9.17", color: "blue" },
  { category: "라이프", icon: "🚘", title: "수입차 브랜드 등록 순위 TOP 10", desc: "테슬라 10,400대 · 2026년 8월", tag: "8월", color: "navy" },
  { category: "스포츠", icon: "⚾", title: "2026 KBO 타점 순위 TOP 5", desc: "오스틴·디아즈·김도영 · 홈런과 다른 타점 경쟁", tag: "NEW", color: "green" },
  { category: "스포츠", icon: "⚾", title: "KBO 역대 한 시즌 홈런 TOP 20", desc: "이승엽 56홈런부터 · 역대 20개 시즌 기록", tag: "역대", color: "blue" },
  { category: "미디어", icon: "🎬", title: "크리스토퍼 놀란 영화 국내 흥행 순위", desc: "인터스텔라부터 오디세이까지 · 관객 비교", tag: "NEW", color: "purple" },
  { category: "미디어", icon: "🕷", title: "역대 스파이더맨 영화 흥행 순위", desc: "실사·애니메이션 11편 · 세계 매출 비교", tag: "NEW", color: "red" },
  { category: "스포츠", icon: "⚾", title: "2026 KBO 구단 관중", desc: "역대 최소 565경기 만에 1,000만 돌파", tag: "NEW", color: "blue" },
  { category: "미디어", icon: "▶", title: "OTT 인기 콘텐츠", desc: "나는 SOLO·우리의 끈끈한 사랑", tag: "주간", color: "pink" },
  { category: "라이프", icon: "🚘", title: "국내 자동차 판매량", desc: "8월 쏘렌토 6,397대 1위", tag: "8월", color: "navy" },
  { category: "스포츠", icon: "⚽", title: "한국 축구선수 연봉", desc: "이강인 AT마드리드 데뷔골 반영", tag: "8.24", color: "green" },
  { category: "미디어", icon: "🌍", title: "2026년 세계 영화 흥행", desc: "스파이더맨·오디세이 최신 흥행", tag: "8.27", color: "purple" },
  { category: "스포츠", icon: "⚾", title: "MLB 한국 선수 역대 연봉", desc: "시즌별 최고 연봉과 누적 기록", tag: "역대", color: "blue" },
  { category: "스포츠", icon: "🥊", title: "UFC 체급별 랭킹", desc: "챔피언부터 한국 선수까지", tag: "주간", color: "red" },
  { category: "미디어", icon: "🎬", title: "역대 국내 영화 관객", desc: "천만 영화와 흥행 기록 모음", tag: "역대", color: "purple" },
  { category: "미디어", icon: "📺", title: "역대 드라마 시청률", desc: "지상파·케이블 최고 기록", tag: "역대", color: "orange" },
  { category: "라이프", icon: "✈", title: "한국인이 찾는 여행지", desc: "해외여행 목적지 관심도", tag: "월간", color: "cyan" },
  { category: "서비스", icon: "◫", title: "국내 OTT 서비스", desc: "2025년 4월 스마트폰 앱 사용자", tag: "과거 통계", color: "black" },
  { category: "글로벌", icon: "¥", title: "일본 AV 배우 인기", desc: "월간 검색·스트리밍 관심 순위", tag: "19+", color: "rose" },
  { category: "글로벌", icon: "🏆", title: "세계 스포츠 스타 수입", desc: "연봉과 광고 수입 종합", tag: "연간", color: "gold" },
  { category: "글로벌", icon: "🏙", title: "세계 최고층 빌딩", desc: "완공 건축물 높이 TOP 6", tag: "역대", color: "blue" },
  { category: "글로벌", icon: "🌍", title: "세계 인구", desc: "UN 추계로 보는 국가별 인구", tag: "연간", color: "green" },
  { category: "라이프", icon: "👥", title: "대한민국 시도 인구", desc: "행정안전부 월간 주민등록 인구", tag: "월간", color: "orange" },
  { category: "라이프", icon: "⛰", title: "대한민국 높은 산", desc: "대표 정상 해발고도 비교", tag: "역대", color: "cyan" },
  { category: "글로벌", icon: "$", title: "세계 GDP", desc: "IMF 전망으로 보는 경제 규모", tag: "연간", color: "gold" },
  { category: "글로벌", icon: "▰", title: "세계에서 가장 큰 나라", desc: "육지 면적 기준 국가 비교", tag: "역대", color: "green" },
  { category: "글로벌", icon: "▲", title: "세계에서 가장 높은 산", desc: "8천 미터급 정상 고도 비교", tag: "역대", color: "navy" },
  { category: "라이프", icon: "✈", title: "세계 관광객 방문 국가", desc: "해외 관광객이 많이 찾은 나라", tag: "연간", color: "purple" },
];

const hot = [
  ["한국 야구 통산 7회·대회 5연패", "역대 아시안게임 야구 우승 국가 순위", "급상승", "asian-games-baseball-champions"],
  ["한국 3위·9월 23일 메달 집계", "2026 아시안게임 국가별 메달 순위", "대회중", "asian-games-medal-table-2026"],
  ["The Warriors 넷플릭스 영화 1위", "이번 주 넷플릭스 영화 TOP 10", "주간", "netflix-korea-films-weekly"],
  ["오디세이 천만 관객 돌파", "2026년 국내 영화 흥행", "흥행", "korea-box-office-2026"],
  ["테슬라 8월 10,400대", "수입차 브랜드 등록 순위 TOP 10", "급상승", "korea-import-car-brands"],
];

const weeklyKeywords = ["한국 야구 5연패", "아시안게임 야구 통산 7회", "아시안게임 한국 3위", "넷플릭스 The Warriors", "오디세이 천만"];


const upcoming = ["프로야구 선수 연봉", "KBO 통산 홈런", "KBO 통산 투수승", "유튜버 구독자", "유튜버 추정 수입", "아파트 실거래가", "국내 대학 입결", "직업별 평균 연봉", "게임 매출", "모바일 앱 사용자", "치킨 브랜드 매장 수", "커피 프랜차이즈 매장 수", "편의점 매출", "항공사 이용객", "세계 축구클럽 가치", "역대 예능 시청률", "음원 스트리밍", "아이돌 앨범 판매", "웹툰 인기", "배달앱 사용자", "전기차 판매", "국내 캠핑장 인기", "반려견 품종", "세계 공항 이용객"];

function BrandLogo({ footer = false }: { footer?: boolean }) {
  return (
    <a className={`logo${footer ? " footer-logo" : ""}`} href="#top" aria-label="순위ZIP 홈">
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 40 40">
          <path className="house" d="M5.5 18.4 20 6.5l14.5 11.9v14.1a2 2 0 0 1-2 2h-25a2 2 0 0 1-2-2Z" />
          <path className="roof" d="m3.8 19.2 16.2-13 16.2 13" />
          <path className="bars" d="M12 29v-6m8 6V18m8 11V13" />
          <path className="arrow" d="m23.8 13 4.2-4 4.2 4M28 9v7" />
        </svg>
      </span>
      <span className="logo-word">순위<b>ZIP</b></span>
    </a>
  );
}

export default function Home() {
  const [active, setActive] = useState<Category>("전체");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => rankings.filter((item) =>
    !pageBySlug[slugByTitle[item.title]]?.noindex && (active === "전체" || item.category === active) &&
    (item.title + item.desc).toLowerCase().includes(query.toLowerCase())
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
          <p className="hero-desc">스포츠 기록부터 영화, 자동차, OTT까지.<br/>찾기 어려웠던 흥미로운 데이터를 보기 쉽게 모았습니다.</p>
          <div className="hero-actions"><a href="#rankings">순위 둘러보기 <b>→</b></a><span>매주 새로운 랭킹 업데이트</span></div>
        </div>
        <div className="hero-board" aria-label="오늘의 인기 순위">
          <div className="board-head"><div><i></i>이번 주 주목할 랭킹</div><span>편집 선정</span></div>
          {hot.slice(0,3).map((item, i) => <a href={`/rankings/${item[3]}`} className="hero-row" key={item[0]}><b>{i+1}</b><div className={`avatar a${i}`}>{["⚾","🏅","🎬"][i]}</div><p><strong>{item[0]}</strong><small>{item[1]}</small></p><em>{item[2]}</em></a>)}
          <div className="board-foot">2026.09.28 자료 점검 · 편집 선정 <b>↗</b></div>
        </div>
      </section>

      <section className="ticker"><div><b>HOT</b><strong>이번 주 관심 키워드 · 9월 28일</strong>{weeklyKeywords.map((x,i)=><span key={x}><i>{i+1}</i>{x}</span>)}</div></section>

      <section className="content" id="rankings">
        <div className="section-heading"><div><p>EXPLORE RANKINGS</p><h2>분야별 인기 순위</h2></div><span>관심 있는 분야를 선택해 보세요</span></div>
        <div className="tabs" role="tablist">{categories.map((cat) => <button role="tab" aria-selected={active===cat} className={active===cat?"active":""} key={cat} onClick={()=>setActive(cat)}>{cat}</button>)}</div>
        <div className="layout">
          <div className="card-grid">
            {filtered.map((item) => <article className="rank-card" key={item.title}>
              <div className={`icon ${item.color}`}>{item.icon}</div><span className="badge">{item.tag}</span>
              <small>{item.category}</small><h3>{pageBySlug[slugByTitle[item.title]]?.title||item.title}</h3><p>{pageBySlug[slugByTitle[item.title]]?.date} · {pageBySlug[slugByTitle[item.title]]?.basis}</p>
              <a className="rank-link" href={`/rankings/${slugByTitle[item.title]}`}>상세 자료 보기 <b>→</b></a>
            </article>)}
            {!filtered.length && <div className="empty">검색 결과가 없습니다. 다른 키워드를 입력해 보세요.</div>}
          </div>
          <aside>
            <div className="aside-title"><div><span>↗</span><p><small>EDITOR'S PICKS</small><strong>지금 주목할 랭킹</strong></p></div><em>추천</em></div>
            {hot.map((item,i)=><a className="trend" href={`/rankings/${item[3]}`} key={item[0]}><b>{i+1}</b><p><strong>{item[0]}</strong><small>{item[1]}</small></p><em className="up">{item[2]}</em></a>)}
            <button className="all-button">인기 랭킹 전체보기 <b>→</b></button>
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
