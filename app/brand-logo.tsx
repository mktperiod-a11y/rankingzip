export function BrandLogo({ footer = false, href = "#top" }: { footer?: boolean; href?: string }) {
  return (
    <a className={`logo${footer ? " footer-logo" : ""}`} href={href} aria-label="순위ZIP 홈">
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" width="40" height="40">
          <path d="M8 18.6 18.4 9.7a2.5 2.5 0 0 1 3.2 0L32 18.6V30a2.5 2.5 0 0 1-2.5 2.5h-19A2.5 2.5 0 0 1 8 30Z" fill="#fff"/>
          <rect x="12.6" y="22" width="4.4" height="7.5" rx="1.3" fill="#0a5cff" fillOpacity=".5"/>
          <rect x="17.8" y="17" width="4.4" height="12.5" rx="1.3" fill="#0a5cff"/>
          <rect x="23" y="24.5" width="4.4" height="5" rx="1.3" fill="#0a5cff" fillOpacity=".32"/>
        </svg>
      </span>
      <span className="logo-word">순위<b>ZIP</b></span>
    </a>
  );
}
