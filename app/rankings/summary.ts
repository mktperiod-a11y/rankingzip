import type { RankingPage } from './data';
import { dateParts } from './date-parts';

export function referenceOf(p: RankingPage) {
  const { reference, updated } = dateParts(p.date, p.auditDate);
  return reference.split(' · ')[0] || updated;
}

export function answerOf(p: RankingPage) {
  const when = referenceOf(p);
  const prefix = when ? `${when} 기준 ` : '';
  if (p.p4p?.length) return `${prefix}UFC P4P 1위는 ${p.p4p[0].name}입니다.`;
  if (p.unranked || !p.rows.length) return undefined;
  const top = p.rows[0];
  const value = top.value && !/^\d+위$/.test(top.value.trim()) ? `, ${top.value}` : '';
  return `${prefix}1위는 ${top.name}${value}입니다.`;
}

export function updatedOf(p: RankingPage) {
  return dateParts(p.date, p.auditDate).updated?.replace(/\./g, '-');
}
