import type { RankingPage, RankingRow } from './data';
import { netflixFilms } from './netflix';
import assetSources from '../../public/ranking-images/updates/sources.json';

const assets = assetSources as Record<string,{image:string;source?:string}>;
const art = (key:string) => ({image:assets[key]?.image, imageSource:assets[key]?.source});
const kbo = 'https://www.koreabaseball.com/Record/History/Top/Hitter.aspx';
const hrSources:Record<string,string>={
 'Mel_Rojas_Jr.':'https://www.koreabaseball.com/MediaNews/Notice/View.aspx?bdSe=11520',
 'Matt_Davidson':'https://www.koreabaseball.com/Record/Player/HitterDetail/Basic.aspx?playerId=54944',
 'Kim_Jae-hwan_(baseball)':'https://www.koreabaseball.com/Record/Player/HitterDetail/Basic.aspx?playerId=78224',
 'Dan_Rohrmeier':'https://star.ohmynews.com/NWS_Web/OhmyStar/at_pg.aspx?CNTN_CD=A0000308427',
 'Jamie_Romak':'https://mykbostats.com/players/1623-Jamie-Romak-SSG-Landers',
 'Tyrone_Woods':'https://www.busan.com/view/busan/view.php?code=19981002001374',
 'Lewin_Díaz':'https://www.koreabaseball.com/MediaNews/News/Preview/View.aspx?bdSe=62036',
};
const hr: [string,number,string,number,string][] = [
 ['이승엽',2003,'삼성',56,'Lee_Seung-yuop'],['이승엽',1999,'삼성',54,'Lee_Seung-yuop'],
 ['심정수',2003,'현대',53,'Shim_Jung-soo'],['박병호',2015,'넥센',53,'Park_Byung-ho'],
 ['박병호',2014,'넥센',52,'Park_Byung-ho'],['르윈 디아즈',2025,'삼성',50,'Lewin_Díaz'],
 ['야마이코 나바로',2015,'삼성',48,'Yamaico_Navarro'],['이승엽',2002,'삼성',47,'Lee_Seung-yuop'],
 ['에릭 테임즈',2015,'NC',47,'Eric_Thames'],['멜 로하스 주니어',2020,'KT',47,'Mel_Rojas_Jr.'],
 ['심정수',2002,'현대',46,'Shim_Jung-soo'],['최정',2017,'SK',46,'Choi_Jeong'],
 ['맷 데이비슨',2024,'NC',46,'Matt_Davidson'],['댄 로마이어',1999,'한화',45,'Dan_Rohrmeier'],
 ['이대호',2010,'롯데',44,'Lee_Dae-ho'],['김재환',2018,'두산',44,'Kim_Jae-hwan_(baseball)'],
 ['박병호',2018,'넥센',43,'Park_Byung-ho'],['제이미 로맥',2018,'SK',43,'Jamie_Romak'],
 ['멜 로하스 주니어',2018,'KT',43,'Mel_Rojas_Jr.'],['타이론 우즈',1998,'OB',42,'Tyrone_Woods'],
];
const nolanSource='https://v.daum.net/v/VFPSf9DgXg';
const nolan: [string,string,string,string,string][] = [
 ['인터스텔라','약 1,038만명','2014 · 2026.08.16 보도 기준','Interstellar_(film)',nolanSource],
 ['오디세이','7,656,205명','2026 · 2026.08.26까지 누적','The_Odyssey_(2026_film)','https://news.nate.com/view/20260827n11285?mid=e1300'],
 ['다크 나이트 라이즈','약 642만명','2012 · 2026.08.16 보도 기준','The_Dark_Knight_Rises',nolanSource],
 ['인셉션','약 601만명','2010 · 2026.08.16 보도 기준','Inception',nolanSource],
 ['다크 나이트','약 428만명','2008 · 2026.08.16 보도 기준','The_Dark_Knight',nolanSource],
 ['오펜하이머','약 323만명','2023 · 2026.08.16 보도 기준','Oppenheimer_(film)',nolanSource],
 ['덩케르크','약 281만명','2017 · 2023.09.11 보도 기준','Dunkirk_(2017_film)','https://www.nocutnews.co.kr/news/6010318'],
 ['테넷','약 200만명','2020 · 2023.09.11 보도 기준','Tenet_(film)','https://www.nocutnews.co.kr/news/6010318'],
];
const spider: [string,number,number,string][] = [
 ['스파이더맨: 브랜드 뉴 데이',2026,2229461878,'Spider-Man:_Brand_New_Day'],
 ['스파이더맨: 노 웨이 홈',2021,1921206586,'Spider-Man:_No_Way_Home'],
 ['스파이더맨: 파 프롬 홈',2019,1132298674,'Spider-Man:_Far_From_Home'],
 ['스파이더맨 3',2007,896337268,'Spider-Man_3'],
 ['스파이더맨: 홈커밍',2017,878852749,'Spider-Man:_Homecoming'],
 ['스파이더맨',2002,823929972,'Spider-Man_(2002_film)'],
 ['스파이더맨 2',2004,797001599,'Spider-Man_2'],
 ['어메이징 스파이더맨',2012,758576824,'The_Amazing_Spider-Man_(film)'],
 ['어메이징 스파이더맨 2',2014,709672746,'The_Amazing_Spider-Man_2'],
 ['스파이더맨: 어크로스 더 유니버스',2023,690824738,'Spider-Man:_Across_the_Spider-Verse'],
 ['스파이더맨: 뉴 유니버스',2018,373807069,'Spider-Man:_Into_the_Spider-Verse'],
];

export const extraPages: RankingPage[] = [
 {slug:'kbo-single-season-home-runs',title:'KBO 역대 한 시즌 홈런 TOP 20',category:'스포츠',date:'2025시즌 종료 · 2026.08.27 확인',basis:'1982~2025 KBO 정규시즌 · 선수-시즌별 홈런 · 동률 공동 순위',description:'이승엽의 56홈런부터 우즈의 42홈런까지, 한 시즌을 수놓은 20개 홈런 기록을 비교합니다. 동일 선수가 여러 시즌에 등장하며 진행 중인 2026시즌과 포스트시즌은 제외합니다.',source:'KBO 역대 기록실',sourceUrl:kbo,
 rows:hr.map(([name,year,team,value,key])=>({name:`${name} · ${year}`,value:`${value}홈런`,note:`${team} · ${year} 정규시즌${assets[key]?' · 사진은 기록 당시와 다를 수 있음':' · 사진 확보 중'}`,rank:hr.findIndex(x=>x[3]===value)+1,sourceUrl:hrSources[key]||'https://ko.wikipedia.org/wiki/KBO_리그_홈런_관련_기록_-_개인',...art(key)})),
 faq:[['왜 이승엽과 박병호가 여러 번 나오나요?','선수별 통산 기록이 아니라 선수 한 명이 특정 시즌에 기록한 홈런을 비교하기 때문입니다.'],['동률은 어떻게 표시하나요?','같은 홈런 수는 공동 순위입니다. 53홈런 두 기록은 공동 3위이며 다음 기록은 5위입니다.'],['김도영의 2026시즌도 포함되나요?','아니요. 이 표는 2025년까지 종료된 시즌 기록만 비교합니다. 진행 중인 시즌은 종료 후 반영합니다.']]},
 {slug:'christopher-nolan-korea-box-office',title:'크리스토퍼 놀란 영화 국내 흥행 순위',category:'미디어',date:'2026.08.27 자료 확인',basis:'국내 누적 관객 · 공개 보도 기준 TOP 8 · 작품별 집계 시점 표시',posterLayout:true,description:'오디세이는 놀란 감독의 국내 흥행작 중 어디까지 올라왔을까요? 전작과 신작을 국내 관객 수로 비교합니다. 전작은 확인 가능한 보도 수치이며, 같은 날짜의 KOBIS 전수 집계가 아닙니다. 재개봉·보정에 따라 최신 합계와 차이가 있을 수 있습니다.',source:'국내 흥행 TOP 5·전작 관객 보도 (2026.08.16)',sourceUrl:nolanSource,
 rows:nolan.map(([name,value,note,key,sourceUrl])=>({name,value,note,sourceUrl,...art(key)})),
 faq:[['국내 흥행 1위는 어떤 작품인가요?','확인한 공개 보도 기준 인터스텔라가 약 1,038만 관객으로 가장 높습니다.'],['오디세이는 어느 시점의 수치인가요?','2026년 8월 26일까지 누적 7,656,205명으로, 8월 27일 보도를 반영했습니다.'],['모든 수치가 8월 27일의 정확한 누적치인가요?','아닙니다. 전작은 각 행에 표시된 보도 기준의 반올림 수치입니다. 최신 KOBIS 전수 집계와 동일하다고 보아서는 안 됩니다.']]},
 {slug:'spider-man-worldwide-box-office',title:'역대 스파이더맨 영화 흥행 순위',category:'미디어',date:'2026년 8월 27일 확인',basis:'전 세계 극장 누적 매출 · 미국 달러 · 물가 보정 없음',posterLayout:true,description:'실사와 장편 애니메이션을 함께 비교한 스파이더맨 시리즈 11편의 세계 흥행 순위입니다. 어벤져스 등 조연 출연작, 단편, 합본 상영과 미개봉 작품은 제외합니다. 상영 중인 작품의 매출은 계속 변동됩니다.',source:'The Numbers · Spider-Man 프랜차이즈',sourceUrl:'https://www.the-numbers.com/movies/franchise/Spider-Man',
 rows:spider.map(([name,year,value,key])=>({name,value:`$${value.toLocaleString('en-US')}`,note:`${year} · 전 세계 누적 매출`,...art(key)})),
 faq:[['국내 관객 수 순위인가요?','아니요. 전 세계 극장 매출을 미국 달러로 비교한 순위입니다.'],['애니메이션도 포함되나요?','뉴 유니버스와 어크로스 더 유니버스 등 개봉한 장편 애니메이션을 포함합니다.'],['흥행 수익은 순이익인가요?','아닙니다. 극장 매출이며 제작비·마케팅비·배급 수수료 등을 뺀 순이익은 아닙니다.']]},
 {slug:'netflix-korea-films-weekly',title:'이번 주 넷플릭스 영화 TOP 10',category:'미디어',basis:'Netflix 공식 · 대한민국 · 영화 · 주간 TOP 10',posterLayout:true,source:'Netflix Tudum · South Korea Films',sourceUrl:'https://www.netflix.com/tudum/top10/south-korea/films',
 ...netflixFilms},
];
export const extraSlugs:Record<string,string> = Object.fromEntries(extraPages.map(p=>[p.title,p.slug]));
