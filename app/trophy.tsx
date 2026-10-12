const TROPHY_COLORS = [["#ffd45a", "#e3a300"], ["#d9dee6", "#9aa4b2"], ["#f0b07a", "#c06a2b"]];

export function Trophy({ rank, size = 24 }: { rank: number; size?: number }) {
  const [from, to] = TROPHY_COLORS[rank];
  const fill = `url(#trophy-${rank})`;
  return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <defs><linearGradient id={`trophy-${rank}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={from} /><stop offset="1" stopColor={to} /></linearGradient></defs>
    <path d="M7 5H4.5v1.5A3.5 3.5 0 0 0 8 10M17 5h2.5v1.5A3.5 3.5 0 0 1 16 10" fill="none" stroke={fill} strokeWidth="1.8" strokeLinecap="round" />
    <path d="M6.5 3h11v5.5a5.5 5.5 0 0 1-11 0Z" fill={fill} />
    <rect x="10.9" y="13.5" width="2.2" height="3.5" fill={fill} />
    <rect x="7.5" y="17" width="9" height="3" rx="1" fill={fill} />
  </svg>;
}

export function RankTrophy({ rank, size }: { rank: number; size: number }) {
  return <b className={`rank-trophy t${rank}`} aria-label={`${rank}위`} style={{ width: size, height: size, fontSize: Math.round(size * 0.3) }}><Trophy rank={rank - 1} size={size} /><span>{rank}</span></b>;
}
