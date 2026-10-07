import type { RankingPage } from './data';
import { dateParts } from './date-parts';

/** 모든 항목이 공유하는 설명은 상단 기준에 한 번만 표시합니다. 개별 항목 설명은 남깁니다. */
export function rankingPresentation(p: RankingPage) {
  const dates = dateParts(p.date, p.auditDate);
  const parts = p.rows.map(r => r.note.split(' · ').map(s => s.trim()).filter(Boolean));
  const shared = parts.length > 1
    ? [...new Set(parts[0])].filter(s => parts.every(row => row.includes(s)))
    : [];
  const normalize = (s: string) => s.replace(/[\s·.,]/g, '');
  const candidates = [dates.reference, p.basis, ...shared].filter(Boolean);
  const criteria = candidates.filter((s, i) => !candidates.some((other, j) =>
    j !== i && normalize(other).includes(normalize(s)) && (normalize(other) !== normalize(s) || j < i)
  ));
  return {
    basis: criteria.join(' · '),
    updated: dates.updated,
    notes: parts.map(row => row.filter(s => !shared.includes(s) && !/^\d+위(?:권)?$/.test(s)).join(' · ')),
  };
}
