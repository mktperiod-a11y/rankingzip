// 상세 화면 상단 라벨용으로 자료 날짜 문구를 "기준 시점"과 "업데이트(우리가 마지막으로 확인한 날)"로 나눕니다.
// 업데이트는 문구 속 확인일, 사이트 점검일, 기준 시점에 적힌 날짜 중 가장 늦은 날입니다.
// 예) "2026년 8월 · 9월 7일 확인" → { reference: "2026년 8월", updated: "2026.09.07" }
const CHECKED = /(확인|조회|점검|대조|갱신)$/;
const pad = (n: string | number) => String(n).padStart(2, "0");

export function dateParts(date: string, fallbackUpdated?: string) {
  const year = date.match(/(\d{4})[.년]/)?.[1] ?? fallbackUpdated?.slice(0, 4) ?? String(new Date().getFullYear());
  const reference: string[] = [];
  let updated: string | undefined;
  for (const part of date.split(" · ").map((s) => s.trim()).filter(Boolean)) {
    if (updated || !CHECKED.test(part)) { reference.push(part.replace(/\s*기준$/, "")); continue; }
    let m: RegExpMatchArray | null;
    if ((m = part.match(/(\d{4})\.(\d{2})\.(\d{2})/))) updated = `${m[1]}.${m[2]}.${m[3]}`;
    else if ((m = part.match(/(?:(\d{4})년 )?(\d{1,2})월 (\d{1,2})일/))) updated = `${m[1] ?? year}.${pad(m[2])}.${pad(m[3])}`;
    else if ((m = part.match(/(\d{2})\.(\d{2})/))) updated = `${year}.${m[1]}.${m[2]}`;
    else reference.push(part);
  }
  const fullDates = reference.join(" ").match(/\d{4}\.\d{2}\.\d{2}/g) ?? [];
  const latest = [updated, fallbackUpdated, ...fullDates].filter((d): d is string => !!d).sort().at(-1);
  return { reference: reference.join(" · "), updated: latest };
}
