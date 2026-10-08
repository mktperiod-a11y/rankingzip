export type HomeRanking = {
  slug: string; title: string; date: string; auditDate?: string;
  noindex?: boolean; unranked?: boolean; rows: { name: string }[];
};
