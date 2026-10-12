const TONES = [
  { light: "#fff3b8", mid: "#f6c23e", dark: "#c98a06", rim: "#fde68a", ink: "#7a4a00" },
  { light: "#ffffff", mid: "#d5dbe4", dark: "#98a3b3", rim: "#eef1f5", ink: "#475263" },
  { light: "#ffe2c7", mid: "#e0965a", dark: "#a8582a", rim: "#f6c7a1", ink: "#5f2d0e" },
];

export function Medal({ rank, size = 28 }: { rank: number; size?: number }) {
  const t = TONES[rank - 1];
  const id = `medal-${rank}`;
  return (
    <svg viewBox="0 9 40 39" width={size * (40 / 39)} height={size} aria-hidden="true" className="medal-svg">
      <defs>
        <radialGradient id={`${id}-coin`} cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor={t.light} />
          <stop offset=".55" stopColor={t.mid} />
          <stop offset="1" stopColor={t.dark} />
        </radialGradient>
        <linearGradient id={`${id}-inner`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={t.mid} />
          <stop offset="1" stopColor={t.light} />
        </linearGradient>
        <clipPath id={`${id}-clip`}><circle cx="20" cy="31" r="14" /></clipPath>
      </defs>
      <path d="M9 0h9l5 15-6 5Z" fill="#1f56d6" />
      <path d="M31 0h-9l-5 15 6 5Z" fill="#3b7bff" />
      <path d="M13.5 0h3l4 12-2 1.5Z" fill="#fff" opacity=".35" />
      <circle cx="20" cy="31" r="14" fill={`url(#${id}-coin)`} />
      <circle cx="20" cy="31" r="10.6" fill={`url(#${id}-inner)`} stroke={t.rim} strokeWidth="1.2" />
      <g clipPath={`url(#${id}-clip)`}>
        <rect className="medal-shine" x="-14" y="14" width="8" height="36" fill="#fff" opacity=".55" />
      </g>
      <text x="20" y="35.6" textAnchor="middle" fontSize="13" fontWeight="900" fill={t.ink} fontFamily="Pretendard Variable, Pretendard, -apple-system, sans-serif">{rank}</text>
    </svg>
  );
}

export function RankMedal({ rank, size }: { rank: number; size: number }) {
  if (!TONES[rank - 1]) return <b className="rank-medal plain" aria-label={`${rank}위`}>{rank}</b>;
  return <b className={`rank-medal m${rank}`} aria-label={`${rank}위`}><Medal rank={rank} size={size} /></b>;
}
