"use client";

import { useEffect, useRef, useState } from "react";
import type { TrendPick } from "../lib/trends";

const FIRST_MS = 900;
const EVERY_MS = 5000;
const STAGGER_MS = 90;

export function TrendRoll({ picks }: { picks: TrendPick[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tick, setTick] = useState(0);
  const [visible, setVisible] = useState(false);
  const [held, setHeld] = useState(false);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    const onVis = () => setShown(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  useEffect(() => {
    if (!visible || held || !shown || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => setTick((n) => n + 1), tick ? EVERY_MS : FIRST_MS);
    return () => clearTimeout(timer);
  }, [visible, held, shown, tick]);

  return (
    <div className="trend-list" ref={ref} onMouseEnter={() => setHeld(true)} onMouseLeave={() => setHeld(false)} onFocus={() => setHeld(true)} onBlur={() => setHeld(false)}>
      {picks.map((item, i) => (
        <a className="trend" href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noreferrer" : undefined} key={item.title}>
          <b>{i + 1}</b>
          <p>
            <strong className="roll">
              <span className="roll-reel" key={tick} data-run={tick > 0} style={{ animationDelay: `${i * STAGGER_MS}ms` }}>
                <span>{item.title}</span>
                <span aria-hidden="true">{item.title}</span>
              </span>
            </strong>
            <small>{item.subtitle}</small>
          </p>
          {item.label !== "급상승" && <em className="up">{item.label}</em>}
        </a>
      ))}
    </div>
  );
}
