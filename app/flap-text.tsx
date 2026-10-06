// 글자 타일이 가로축으로 한 장씩 넘어가며 나타나는 플립(스플릿 플랩) 텍스트. run이 바뀌면 다시 넘어갑니다.
export function FlapText({ text, delay = 0, run = 0 }: { text: string; delay?: number; run?: number }) {
  return (
    <span className="flap" aria-label={text}>
      {[...text].map((c, i) => (
        <span key={`${run}-${i}`} aria-hidden="true" className="flap-ch" style={{ animationDelay: `${delay + i * 32}ms` }}>
          {c === " " ? " " : c}
        </span>
      ))}
    </span>
  );
}
