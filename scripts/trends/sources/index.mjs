// 수집 소스 목록. 새 소스는 sources/<id>.mjs 파일을 만들고 여기에 한 줄 추가하면 됩니다.
// 각 모듈은 id, label, homepage, parse(), collect(): Promise<TrendItem[]> 를 내보냅니다.
import * as googleTrends from './google-trends.mjs';
import * as namuwiki from './namuwiki.mjs';

export const sources = [googleTrends, namuwiki];
