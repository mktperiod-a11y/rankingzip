"use client";

import { useEffect, useState } from "react";

// 공항 출발 안내판(스플릿 플랩)처럼 글자 칸의 위쪽 절반이 앞으로 넘어가며 바뀌는 텍스트.
// 칸 너비는 목표 글자에 고정하고, 칸마다 불투명한 위·아래 반쪽을 겹쳐 넘기므로 넘기는 중에도 글자가 겹치지 않습니다.
// run이 바뀔 때마다 각 글자가 같은 종류의 임의 글자 두 장을 넘긴 뒤 원래 글자에 멈춥니다.
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
    // 마지막 장이 다 넘어가면 넘김 장을 걷어 정지 상태로 돌아갑니다.
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
