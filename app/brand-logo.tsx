// 순위ZIP 로고. 메인과 순위 상세 화면이 함께 씁니다.
export function BrandLogo({ footer = false, href = "#top" }: { footer?: boolean; href?: string }) {
  return (
    <a className={`logo${footer ? " footer-logo" : ""}`} href={href} aria-label="순위ZIP 홈">
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 40 40">
          <path className="house" d="M5.5 18.4 20 6.5l14.5 11.9v14.1a2 2 0 0 1-2 2h-25a2 2 0 0 1-2-2Z" />
          <path className="roof" d="m3.8 19.2 16.2-13 16.2 13" />
          <path className="bars" d="M12 29v-6m8 6V18m8 11V13" />
          <path className="arrow" d="m23.8 13 4.2-4 4.2 4M28 9v7" />
        </svg>
      </span>
      <span className="logo-word">순위<b>ZIP</b></span>
    </a>
  );
}
