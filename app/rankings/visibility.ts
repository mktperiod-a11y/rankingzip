import type { RankingPage } from './data';
import pool from '../../data/webhard-pool.json';

const normalize = (value: string) => value.normalize('NFKC').replace(/\s+/g, '').toLowerCase();
const blocked = pool.blocked.map(normalize);
const blockedDomains = ['me2disk.com', 'filecast.co.kr', 'fileis.com'];
export function applyVisibility(pages: RankingPage[]): RankingPage[] {
  return pages.map(p => {
    const rows = p.rows.filter(row => {
      const text = normalize([row.name, row.note, row.sourceUrl, row.image, row.imageSource].join(' '));
      return ![...blocked, ...blockedDomains].some(name => text.includes(name));
    });
    return rows.length === p.rows.length ? p : { ...p, rows: rows.map((r, i) => ({ ...r, rank: i + 1, change: undefined })) };
  });
}
