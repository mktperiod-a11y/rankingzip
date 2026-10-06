// 구글 트렌드 '급상승 검색어' RSS (키 불필요, 국가별 약 10분 간격 갱신)
import { blocks, fetchText, tagText, trendItem } from '../lib.mjs';

export const id = 'google-trends';
export const label = '구글 트렌드 급상승 검색어';
export const homepage = 'https://trends.google.co.kr/trending?geo=KR';
export const feedUrl = 'https://trends.google.co.kr/trending/rss?geo=KR';

export function parse(xml) {
  return blocks(xml, 'item').map((item, i) => {
    const pubDate = tagText(item, 'pubDate');
    return trendItem({
      rank: i + 1,
      keyword: tagText(item, 'title'),
      url: `https://trends.google.co.kr/trending?geo=KR&q=${encodeURIComponent(tagText(item, 'title'))}`,
      traffic: tagText(item, 'ht:approx_traffic') || undefined,
      image: tagText(item, 'ht:picture') || undefined,
      startedAt: pubDate ? new Date(pubDate).toISOString() : undefined,
      news: blocks(item, 'ht:news_item').map((news) => ({
        title: tagText(news, 'ht:news_item_title'),
        url: tagText(news, 'ht:news_item_url'),
        source: tagText(news, 'ht:news_item_source') || undefined,
        image: tagText(news, 'ht:news_item_picture') || undefined,
      })).filter((news) => news.title && news.url),
    });
  }).filter((item) => item.keyword);
}

export async function collect() {
  return parse(await fetchText(feedUrl));
}
