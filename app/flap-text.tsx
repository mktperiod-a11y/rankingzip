"use client";

import { useEffect, useState } from "react";

// 공항 출발 안내판·플립 시계처럼 글자 칸의 위쪽 절반이 앞으로 넘어가며 바뀌는 텍스트.
// run이 바뀔 때마다 각 글자가 임의의 글자 두 장을 넘긴 뒤 원래 글자에 멈춥니다.
const POOLS: [RegExp, string][] = [
  [/[가-힣]/, "가나다라마바사아자차카타파하순위랭킹급상승인기"],
  [/[0-9]/, "0123456789"],
  [/[A-Za-z]/, "ABCDEFGHIJKLMNOPQRSTUVWXYZ"],
];
const STEP_MS = 150;

function FlapChar({ char, start, run }: { char: string; start: number; run: number }) {
  const [state, setState] = useState({ cur: char, prev: char, step: 0 });
  useEffect(() => {
    const pool = POOLS.find(([re]) => re.test(char))?.[1];
    if (!pool || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pick = () => pool[Math.floor(Math.random() * pool.length)];
    const timers = [pick(), pick(), char].map((next, k) =>
      setTimeout(() => setState((s) => ({ cur: next, prev: s.cur, step: s.step + 1 })), start + k * STEP_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [char, start, run]);
  const { cur, prev, step } = state;
  return (
    <span className="fc" aria-hidden="true">
      <span className="fc-size">{cur}</span>
      <span className="fc-half fc-top">{cur}</span>
      <span className="fc-half fc-bottom">{step ? prev : cur}</span>
      {step > 0 && <span key={`t${step}`} className="fc-leaf fc-top">{prev}</span>}
      {step > 0 && <span key={`b${step}`} className="fc-leaf fc-bottom">{cur}</span>}
    </span>
  );
}

export function FlapText({ text, delay = 0, run = 0 }: { text: string; delay?: number; run?: number }) {
  return (
    <span className="flap" aria-label={text}>
      {[...text].map((c, i) => (c === " " ? " " : <FlapChar key={i} char={c} start={delay + i * 45} run={run} />))}
    </span>
  );
}
