"use client";

import { useEffect, useState } from "react";

const POOLS: [RegExp, string][] = [
  [/[가-힣]/, "가나다라마바사아자차카타파하"],
  [/[0-9]/, "0123456789"],
  [/[A-Z]/, "ABCDEFGHKLMNOPRSTUVXYZ"],
  [/[a-z]/, "abcdeghknopqrsuvxyz"],
];
const STEP_MS = 160;
const FLIPS = 3;

function FlapChar({ char, start, run }: { char: string; start: number; run: number }) {
  const [state, setState] = useState({ cur: char, prev: char, step: 0 });
  useEffect(() => {
    const pool = POOLS.find(([re]) => re.test(char))?.[1];
    if (!pool || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pick = () => pool[Math.floor(Math.random() * pool.length)];
    const faces = [...Array.from({ length: FLIPS - 1 }, pick), char];
    const timers = faces.map((next, k) =>
      setTimeout(() => setState((s) => ({ cur: next, prev: s.cur, step: s.step + 1 })), start + k * STEP_MS),
    );
    timers.push(setTimeout(() => setState({ cur: char, prev: char, step: 0 }), start + FLIPS * STEP_MS));
    return () => timers.forEach(clearTimeout);
  }, [char, start, run]);
  const { cur, prev, step } = state;
  return (
    <span className="fc" aria-hidden="true">
      <span className="fc-size">{char}</span>
      <span className="fc-face fc-top">{cur}</span>
      <span className="fc-face fc-bottom">{step ? prev : cur}</span>
      {step > 0 && <span key={`t${step}`} className="fc-face fc-top fc-fall">{prev}</span>}
      {step > 0 && <span key={`b${step}`} className="fc-face fc-bottom fc-drop">{cur}</span>}
    </span>
  );
}

export function FlapText({ text, delay = 0, run = 0 }: { text: string; delay?: number; run?: number }) {
  return (
    <span className="flap" aria-label={text}>
      {[...text].map((c, i) => (c === " " ? " " : <FlapChar key={i} char={c} start={delay + i * 40} run={run} />))}
    </span>
  );
}
