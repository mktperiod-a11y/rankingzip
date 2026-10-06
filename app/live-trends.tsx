"use client";

import { useEffect, useState } from "react";
import type { Trend, TrendSnapshot, TrendSourceId } from "../lib/trends";

const POLL_MS = 5 * 60 * 1000;
const NEW_WINDOW_MS = 3 * 60 * 60 * 1000;
const SHOWN = 10;

type Tab = "all" | TrendSourceId;

const timeFormat = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false });

/** "20000+" → "2만+", "2000+" → "2천+" */
function formatTraffic(traffic?: string) {
  const n = Number(traffic?.replace(/[^\d]/g, ""));
  if (!n) return undefined;
  const plus = traffic?.includes("+") ? "+" : "";
  if (n >= 10000) return `${Math.round(n / 1000) / 10}만${plus}`;
  if (n >= 1000) return `${Math.round(n / 100) / 10}천${plus}`;
  return `${n}${plus}`;
}

function visibleTrends(snapshot: TrendSnapshot, tab: Tab): (Trend & { shownRank: number })[] {
  const list = tab === "all"
    ? snapshot.trends.map((t) => ({ ...t, shownRank: t.rank }))
    : snapshot.trends
      .flatMap((t) => t.sources.filter((s) => s.id === tab).map((s) => ({ ...t, shownRank: s.rank })))
      .sort((a, b) => a.shownRank - b.shownRank);
  return list.slice(0, SHOWN);
}

export function LiveTrends({ initial }: { initial: TrendSnapshot }) {
  const [snapshot, setSnapshot] = useState(initial);
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    const load = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/trends", { cache: "no-store" });
        if (res.ok) setSnapshot(await res.json());
      } catch {
        // 다음 주기에 다시 시도합니다. 화면에는 직전 결과가 그대로 남습니다.
      }
    };
    const timer = setInterval(load, POLL_MS);
    document.addEventListener("visibilitychange", load);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", load); };
  }, []);

  const okSources = snapshot.sources.filter((s) => s.count > 0);
  const tabs: { id: Tab; label: string }[] = [{ id: "all", label: "통합" }, ...okSources.map((s) => ({ id: s.id, label: s.label }))];
  const activeTab = tabs.some((t) => t.id === tab) ? tab : "all";
  const trends = visibleTrends(snapshot, activeTab);
  const updated = new Date(snapshot.updatedAt).getTime();

  return (
    <div className="live" aria-labelledby="live-title">
      <p className="eyebrow live-eyebrow"><i aria-hidden="true"></i>실시간 인기 검색어</p>
      <h1 id="live-title">지금 사람들이 <em>가장 궁금한 것</em></h1>
      <div className="live-bar">
        <div className="live-tabs" role="tablist" aria-label="검색어 출처">
          {tabs.map((t) => <button key={t.id} role="tab" aria-selected={activeTab === t.id} className={activeTab === t.id ? "active" : ""} onClick={() => setTab(t.id)}>{t.label}</button>)}
        </div>
        <time dateTime={snapshot.updatedAt}>{timeFormat.format(updated)} 기준</time>
      </div>
      {trends.length ? (
        <ol className="live-list">
          {trends.map((t) => {
            const news = t.news[0];
            const isNew = t.startedAt && updated - new Date(t.startedAt).getTime() < NEW_WINDOW_MS;
            const traffic = formatTraffic(t.traffic);
            return (
              <li className="live-row" key={t.keyword}>
                <b className={t.shownRank <= 3 ? "top" : ""}>{t.shownRank}</b>
                <div className="live-main">
                  <p className="live-keyword">
                    <strong>{t.keyword}</strong>
                    {isNew && <span className="live-new">NEW</span>}
                    {traffic && <span className="live-traffic">검색 {traffic}</span>}
                  </p>
                  {news
                    ? <a className="live-why" href={news.url} target="_blank" rel="noreferrer">{news.title}{news.source && <small> · {news.source}</small>}</a>
                    : <span className="live-why muted">{t.sources.map((s) => `${snapshot.sources.find((x) => x.id === s.id)?.label ?? s.id} ${s.rank}위`).join(" · ")}</span>}
                </div>
                {t.ranking && <a className="live-rank" href={`/rankings/${t.ranking.slug}`} title={t.ranking.title}>관련 순위 <span aria-hidden="true">→</span></a>}
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="live-empty">실시간 검색어를 불러오지 못했어요. 잠시 후 자동으로 다시 불러옵니다.</p>
      )}
      <p className="live-foot">
        출처 {snapshot.sources.map((s, i) => <span key={s.id}>{i > 0 && " · "}<a href={s.homepage} target="_blank" rel="noreferrer">{s.label}</a></span>)} · 10분마다 갱신
      </p>
    </div>
  );
}
