"use client";

import { useEffect, useRef, useState } from "react";

const stuckBottom = (nav: HTMLElement | null) => (nav ? parseFloat(getComputedStyle(nav).top) + nav.offsetHeight : 0);

export function DivisionNav({ names }: { names: string[] }) {
  const navRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(-1);
  const lock = useRef(0);

  useEffect(() => {
    const cards = names.map((_, i) => document.getElementById(`division-${i + 1}`)).filter((c): c is HTMLElement => !!c);
    const onScroll = () => {
      if (Date.now() < lock.current) return;
      const line = stuckBottom(navRef.current) + 24;
      let current = -1;
      cards.forEach((c, i) => { if (c.getBoundingClientRect().top <= line) current = i; });
      const last = cards.at(-1)?.getBoundingClientRect();
      if (last && last.bottom < 0) current = -1;
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [names]);

  useEffect(() => {
    const nav = navRef.current;
    const chip = nav?.querySelectorAll("button")[active];
    if (nav && chip && nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: chip.offsetLeft - (nav.clientWidth - chip.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  const go = (i: number) => {
    const card = document.getElementById(`division-${i + 1}`);
    const nav = navRef.current;
    if (!card || !nav) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const offset = stuckBottom(nav) + 12;
    lock.current = Date.now() + (reduce ? 50 : 700);
    setActive(i);
    window.scrollTo({ top: window.scrollY + card.getBoundingClientRect().top - offset, behavior: reduce ? "auto" : "smooth" });
    card.classList.remove("flash");
    void card.offsetWidth;
    card.classList.add("flash");
    card.addEventListener("animationend", () => card.classList.remove("flash"), { once: true });
  };

  return (
    <nav className="dp-division-nav" aria-label="체급 바로가기" ref={navRef}>
      {names.map((name, i) => (
        <button key={name} type="button" className={i === active ? "on" : undefined} aria-current={i === active || undefined} onClick={() => go(i)}>
          {name}
        </button>
      ))}
    </nav>
  );
}
