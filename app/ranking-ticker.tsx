"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

export function RankingTicker({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    const run = runRef.current;
    if (!track || !run) return;
    const measure = () => setDuration(run.getBoundingClientRect().width / 4 / 36);
    const resize = new ResizeObserver(measure);
    const intersection = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    resize.observe(run);
    intersection.observe(track);
    return () => {
      resize.disconnect();
      intersection.disconnect();
    };
  }, []);

  return (
    <div className="ticker-track" ref={trackRef} data-running={visible && duration > 0}>
      <div className="ticker-run" ref={runRef} style={{ "--ticker-duration": `${duration || 30}s` } as CSSProperties}>
        {children}
      </div>
    </div>
  );
}
