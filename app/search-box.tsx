"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { suggestWith } from "./links";

export type SearchItem = { slug: string; title: string; category: string; icon: string; color: string; rows: string[] };

const LIMIT = 8;
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");

function mark(text: string, q: string) {
  const i = text.toLowerCase().indexOf(q.trim().toLowerCase());
  if (!q.trim() || i < 0) return text;
  const n = q.trim().length;
  return <>{text.slice(0, i)}<mark>{text.slice(i, i + n)}</mark>{text.slice(i + n)}</>;
}

export function SearchBox({ items, query, onQuery }: { items: SearchItem[]; query: string; onQuery: (q: string) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = norm(query);
    if (!q) return [];
    return items.flatMap((item) => {
      const t = norm(item.title);
      const row = item.rows.find((r) => norm(r).includes(q));
      const score = t.startsWith(q) ? 0 : t.includes(q) ? 1 : norm(item.category).includes(q) ? 2 : row ? 3 : -1;
      return score < 0 ? [] : [{ item, score, row: score === 3 ? row : undefined }];
    }).sort((a, b) => a.score - b.score).slice(0, LIMIT);
  }, [items, query]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) { setOpen(false); setExpanded(false); }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const shut = () => { setOpen(false); setExpanded(false); inputRef.current?.blur(); };
  const show = open && query.trim().length > 0;

  return (
    <div className={`search-wrap${expanded ? " expanded" : ""}`} ref={wrapRef}>
      <div className="search">
        <button type="button" className="search-icon" aria-label="검색" onClick={() => { flushSync(() => { setExpanded(true); setOpen(true); }); inputRef.current?.focus(); }}>⌕</button>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { onQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((n) => Math.min(n + 1, results.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((n) => Math.max(n - 1, 0)); }
            else if (e.key === "Enter" && show && results[active]) { e.preventDefault(); document.getElementById(`search-opt-${active}`)?.click(); }
            else if (e.key === "Escape") shut();
          }}
          placeholder="궁금한 순위를 검색하세요"
          role="combobox"
          aria-expanded={show}
          aria-controls="search-list"
          aria-activedescendant={show && results[active] ? `search-opt-${active}` : undefined}
          aria-autocomplete="list"
        />
      </div>
      <button type="button" className="search-cancel" onClick={() => { onQuery(""); shut(); }}>취소</button>
      {show && (
        <div className="search-pop" id="search-list" role="listbox" aria-label="검색 결과">
          {results.map(({ item, row }, i) => (
            <a key={item.slug} id={`search-opt-${i}`} role="option" aria-selected={i === active} className={i === active ? "on" : undefined} href={`/rankings/${item.slug}`} onMouseEnter={() => setActive(i)}>
              <span className={`sp-icon ${item.color}`} aria-hidden="true">{item.icon}</span>
              <span className="sp-text">
                <strong>{mark(item.title, query)}</strong>
                <small>{item.category}{row && <> · {mark(row, query)} 포함</>}</small>
              </span>
            </a>
          ))}
          {!results.length && (
            <div className="sp-empty">
              <p>‘{query.trim()}’ 순위는 아직 없어요</p>
              <a href={suggestWith(query.trim())} target="_blank" rel="noreferrer">이 순위 제안하기 →</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
