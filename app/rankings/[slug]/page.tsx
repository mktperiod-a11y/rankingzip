import type { Metadata } from "next";
import { pageBySlug, pages } from "../data";
import { rankingPresentation } from "../presentation";
import { rankingCountExceptions } from "../completion";
import { PERSON_SLUGS, portraitOf } from "../portraits";
import { notFound } from 'next/navigation';
import { BrandLogo } from '../../brand-logo';
import "./ranking.css";

export const imageByName: Record<string,string> = {
 "첫사랑":"/ranking-images/drama/first-love.jpg","허준":"/ranking-images/drama/hur-jun.jpg","모래시계":"/ranking-images/drama/sandglass.jpg","사랑이 뭐길래":"/ranking-images/drama/what-is-love.jpg","젊은이의 양지":"/ranking-images/drama/sunny-place.jpg","왕과 사는 남자":"/ranking-images/posters/kings-warden.png","나는 SOLO":"/ranking-images/posters/i-am-solo.jpg","우리의 끈끈한 사랑":"/ranking-images/posters/you-everything.jpg","귀신들린 연애":"/ranking-images/posters/possessed-love.jpg","불량연애":"/ranking-images/posters/badly-in-love.jpg","아파트 잡":"/ranking-images/posters/apartment-job.jpg","더 뉴 그랜저":"/ranking-images/cars/grandeur.jpg","셀토스":"/ranking-images/cars/seltos.png","카니발":"/ranking-images/cars/carnival.png","쏘렌토":"/ranking-images/cars/sorento.png","스포티지":"/ranking-images/cars/sportage.png","포터2":"/ranking-images/cars/porter2.png","일본":"/ranking-images/travel/japan.jpg","베트남":"/ranking-images/travel/vietnam.jpg","중국":"/ranking-images/travel/china.jpg","태국":"/ranking-images/travel/thailand.jpg","대만":"/ranking-images/travel/taiwan.jpg"
};

const portrait=(name:string)=>portraitOf(name)?.image;
export function generateStaticParams(){return pages.map(p=>({slug:p.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;const p=pageBySlug[slug];if(!p)return {};
 const og=[{url:"og.png",width:1200,height:630,alt:`${p.title} | 순위ZIP`}];
 return {title:`${p.title} | 순위ZIP`,description:p.description,robots:p.noindex?{index:false,follow:true}:undefined,alternates:{canonical:`rankings/${slug}`},openGraph:{title:p.title,description:p.description,type:"article",locale:"ko_KR",siteName:"순위ZIP",url:`rankings/${slug}`,images:og},twitter:{card:"summary_large_image",title:p.title,description:p.description,images:og}};
}
const CREDIT_LABELS:Record<string,string>={'apps.apple.com':'앱스토어','en.wikipedia.org':'위키백과','commons.wikimedia.org':'위키미디어 공용','www.koreabaseball.com':'KBO','web1.koreabaseball.com':'KBO','www.kaida.co.kr':'KAIDA','monthly.chosun.com':'월간조선','www.hyundaimotorgroup.com':'현대자동차그룹','tour.pc.go.kr':'평창군 관광'};
type ImageKind = 'flag' | 'logo' | 'photo' | 'photo crest';
const POSTER_SLUGS=["korean-movie-admissions","korea-box-office-2026","worldwide-box-office-2026","korean-drama-ratings","ott-content-weekly","netflix-korea-films-weekly"];
// 넷플릭스 대표 이미지는 가로(16:9)라 세로 포스터 틀 대신 가로 틀에 넣습니다.
const WIDE_POSTER_SLUGS=["ott-content-weekly","netflix-korea-films-weekly"];
// 로고·차량처럼 잘리면 안 되는 이미지를 쓰는 순위는 흰 바탕 틀 안에 전체가 보이게 맞춥니다.
// 앱 아이콘·게임 대표 이미지를 쓰는 서비스 순위는 사진처럼 틀을 꽉 채웁니다.
const LOGO_SLUGS=["korea-import-car-brands","kbo-team-standings-2026","kbo-attendance-2026","korea-car-sales"];

/** 이미지 종류마다 틀 비율이 다릅니다. 국기는 3:2, 로고·차량은 흰 바탕에 전체가 보이게, 인물·장소 사진은 정사각형을 꽉 채웁니다. 포스터는 별도 2:3 카드입니다. */
function imageKind(slug:string,src:string):ImageKind{
 if(src.includes('flagcdn.com'))return 'flag';
 // 인물 순위에서 사진 대신 쓰는 구단 로고는 인물 사진과 같은 정사각형 틀에 흰 바탕으로 넣습니다.
 if(src.includes('/kbo_'))return PERSON_SLUGS.includes(slug)?'photo crest':'logo';
 if(LOGO_SLUGS.includes(slug))return 'logo';
 return 'photo';
}

/** "32,383.920십억 달러", "$2,332,507,928", "56홈런"처럼 앞에 숫자가 있는 값만 막대 비교에 씁니다. 등수("3위") 값은 제외합니다. */
function numericValues(rows:{value:string}[]){
 const values=rows.map(r=>/위$/.test(r.value.trim())?NaN:Number(r.value.replace(/[$,\s]/g,'').match(/^-?\d+(\.\d+)?/)?.[0]));
 return values.length>1&&values.every(v=>Number.isFinite(v)&&v>=0)&&values.some(v=>v>0)?values:null;
}

const changeBadge=(r:{change?:number|'new'})=>r.change==='new'?<em className="dp-change new">NEW</em>:r.change?<em className={`dp-change ${r.change>0?'up':'down'}`}>{r.change>0?`▲${r.change}`:`▼${-r.change}`}</em>:null;

/** 데이터에서 눈에 띄는 사실을 최대 3개 자동으로 뽑습니다. 1·2위 격차, 대한민국 순위, 가장 많이 오른 항목. */
function rankingPoints(rows:{name:string;value:string;rank?:number;change?:number|'new'}[],values:number[]|null){
 const out:string[]=[];
 if(values&&values[1]>0){
  const ratio=values[0]/values[1];
  if(ratio>=1.5)out.push(`1위 ${rows[0].name}, 2위의 ${ratio.toFixed(1)}배`);
  else if(ratio>1.005)out.push(`1위 ${rows[0].name}, 2위보다 ${Math.round((ratio-1)*100)||1}% 높아요`);
  else out.push(`1위와 2위가 거의 같아요`);
 }
 const korea=rows.findIndex(r=>/^(대한민국|한국)$/.test(r.name.trim()));
 if(korea>=0)out.push(`대한민국은 ${rows[korea].rank??korea+1}위`);
 const rising=rows.filter(r=>typeof r.change==='number'&&r.change>0).sort((a,b)=>(b.change as number)-(a.change as number))[0];
 if(rising)out.push(`가장 많이 오른 곳 ${rising.name} ▲${rising.change}`);
 return out.slice(0,3);
}

export default async function RankingDetail({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const p=pageBySlug[slug];if(!p)notFound();
 const schema={"@context":"https://schema.org","@type":"ItemList",name:p.title,description:p.description,numberOfItems:p.rows.length,itemListOrder:p.unranked?"https://schema.org/ItemListUnordered":"https://schema.org/ItemListOrderAscending",itemListElement:p.rows.map((r,i)=>({"@type":"ListItem",position:r.rank??i+1,name:r.name,description:`${r.value} · ${r.note}`}))};
 const faqSchema={"@context":"https://schema.org","@type":"FAQPage",mainEntity:p.faq.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))};
 const json=(value:unknown)=>JSON.stringify(value).replace(/</g,'\\u003c');
 const poster=p.posterLayout||POSTER_SLUGS.includes(p.slug);
 const wide=poster&&WIDE_POSTER_SLUGS.includes(p.slug)?' wide':'';
 const values=p.unranked||p.hideBars?null:numericValues(p.rows);
 const max=values?Math.max(...values):0;
 // 1~3위는 시상대로 따로 보여주고, 목록은 4위부터 이어갑니다.
 const podium=!p.unranked&&!p.divisions&&p.rows.length>=3;
 const start=podium?3:0;
 const points=rankingPoints(p.rows,p.unranked?null:numericValues(p.rows));
 const related=pages.filter(x=>!x.noindex&&x.category===p.category&&x.slug!==p.slug).slice(0,4);
 // 행마다 출처를 반복하지 않습니다. 자료 출처는 오른쪽 DATA SOURCE 카드, 이미지 출처는 목록 아래에 한 번만 모읍니다.
 // 1~3위(시상대)는 파란 주 버튼, 4위부터는 홈 "인기 랭킹 전체보기"와 같은 보조 버튼(btn-sub)을 씁니다.
 const rowSources=(r:typeof p.rows[number],sub=false)=>p.rowLinkLabel&&r.sourceUrl&&<span className="dp-row-links"><a className={sub?"btn-sub":"dp-visit"} href={r.sourceUrl} target="_blank" rel="noreferrer">{p.rowLinkLabel} <b>→</b></a></span>;
 // 인물 사진은 작가·라이선스까지 한 번에 모아 접어 둡니다(CC BY·BY-SA 표시 의무).
 const people=PERSON_SLUGS.includes(p.slug)?[...new Map([...p.rows.map(r=>r.name),...(p.divisions??[]).flatMap(d=>[d.champion,...d.contenders])].map(n=>[n.split(' · ')[0],portraitOf(n)] as const).filter(([,c])=>c)).entries()]:[];
 const imageCredits=[...new Map(p.rows.filter(r=>r.imageSource).map(r=>{const host=new URL(r.imageSource!).host;return [CREDIT_LABELS[host]??host.replace(/^www\./,''),r.imageSource!] as const})).entries()];
 const presentation=rankingPresentation(p);
 return <main className={`detail-page page-${p.slug}`}>
 {!p.noindex&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:json(schema)}}/>}
 {p.faq.length>0&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:json(faqSchema)}}/>}
 <header className="site-header"><div className="header-inner"><BrandLogo href="/"/><a className="dp-all" href="/#rankings">전체 랭킹 <b>→</b></a></div></header>

 <section className="dp-hero"><div className="dp-wrap dp-hero-inner">
  <div><p className="dp-eyebrow">{p.category} {p.unranked?"GUIDE":"RANKING"}</p><h1>{p.title}</h1><p className="dp-desc">{p.description}</p><p className="dp-meta"><span><b>기준</b>{presentation.basis}</span>{presentation.updated&&<span><b>업데이트</b>{presentation.updated}</span>}</p></div>
 </div></section>
 {/* 검증 보류만 본문에 크게 알리고, 일반 점검 기록은 오른쪽 DATA SOURCE 카드에 둡니다. */}
 {p.noindex&&p.auditNote&&<div className="dp-wrap"><section className="dp-audit pending"><b>{p.auditDate} 검증 보류</b><p>{p.auditNote}</p></section></div>}

 {p.divisions&&<section className="dp-wrap dp-divisions"><div className="dp-head"><p>WEIGHT CLASSES</p><h2>체급별 챔피언과 랭커</h2><span>각 체급의 챔피언과 상위 3명입니다. 챔피언은 랭커 1위와 별도입니다.</span></div><div className="dp-division-grid">{p.divisions.map(d=><article className="dp-division" key={d.name}><h3>{d.name}</h3><div className="dp-champion">{portrait(d.champion)?<img src={portrait(d.champion)} alt={`${d.champion} ${d.name} 챔피언`} loading="lazy"/>:<span className="dp-initial">{d.champion.slice(0,1)}</span>}<div><i>CHAMPION</i><strong>{d.champion}</strong></div></div><ol>{d.contenders.map((x,i)=><li key={x}>{portrait(x)?<img src={portrait(x)} alt={`${x} ${d.name} ${i+1}위`} loading="lazy"/>:<span className="dp-initial">{x.slice(0,1)}</span>}<b>{i+1}</b><span>{x}</span></li>)}</ol></article>)}</div></section>}

 <section className="dp-wrap dp-body">
  <div className="dp-main">
   <div className="dp-head"><p>{p.unranked?"REFERENCE":"RANKING"}</p><h2>{p.divisions?"체급을 대표하는 주요 선수":p.unranked?"자료 안내":"순위 한눈에 보기"}</h2>{!p.unranked&&p.rows.length>0&&<span>{p.rows.length}개 항목</span>}</div>
   {!p.rows.length&&<p className="dp-empty">확인되지 않은 수치와 순위는 공개하지 않습니다. 검증 가능한 원자료 확보 후 다시 제공합니다.</p>}
   {!p.noindex&&rankingCountExceptions[p.slug]&&<p className="dp-count-note">{rankingCountExceptions[p.slug]}</p>}
   {points.length>0&&<p className="dp-lede">{points.join(" · ")}</p>}
   {podium&&<ol className={`dp-podium ${poster?'poster':''}${wide}`}>{[1,0,2].map(i=>{const r=p.rows[i];const image=r.image||imageByName[r.name];const rank=r.rank??i+1;return <li key={r.name} className={`place-${i+1}`}><div className={poster?'dp-podium-poster':`dp-thumb ${imageKind(p.slug,image||'')}${image?'':' none'}`}>{image?<img src={image} alt={`${r.name} 대표 이미지`} loading="lazy"/>:<span>{r.name.slice(0,1)}</span>}</div><div className="dp-step"><b className="dp-medal">{rank}</b><h3>{r.name}{changeBadge(r)}</h3>{r.value&&<strong>{r.value}</strong>}{rowSources(r)}</div></li>})}</ol>}
   {poster&&!podium?<ol className={`dp-posters${wide}`} start={start+1}>{p.rows.slice(start).map((r,k)=>{const i=k+start;const image=r.image||imageByName[r.name];return <li key={r.name}><div className="dp-poster">{image?<img src={image} alt={`${r.name} 포스터`} loading="lazy"/>:<span className="dp-noimg">이미지 준비 중</span>}{!p.unranked&&<b className={`dp-rank ${(r.rank??i+1)<=3?'top':''}`}>{r.rank??i+1}</b>}</div><h3>{r.name}{changeBadge(r)}</h3><strong>{r.value}</strong>{presentation.notes[i]&&<p>{presentation.notes[i]}</p>}{rowSources(r,true)}</li>})}</ol>
   :<ol className={`dp-list${poster?` media-list${wide}`:""}`} start={start+1}>{p.rows.slice(start).map((r,k)=>{const i=k+start;const image=r.image||imageByName[r.name];const rank=r.rank??i+1;return <li key={r.name} className={!p.unranked&&rank<=3?'top':''}>{!p.unranked&&<b className="dp-rank">{rank}</b>}<div className={`dp-thumb ${imageKind(p.slug,image||'')}${image?'':' none'}`}>{image?<img src={image} alt={`${r.name} 대표 이미지`} loading="lazy"/>:<span>{r.name.slice(0,1)}</span>}</div><div className="dp-info"><div className="dp-line"><h3>{r.name}{changeBadge(r)}</h3>{r.value&&<strong>{r.value}</strong>}</div>{values&&<div className="dp-bar" aria-hidden="true"><i style={{width:`${values[i]?Math.max(2,values[i]/max*100):0}%`}}/></div>}{presentation.notes[i]&&<p>{presentation.notes[i]}</p>}{rowSources(r,true)}</div></li>})}</ol>}
   {people.length>0&&<details className="dp-photo-credits"><summary>인물 사진 출처 {people.length}건 · 위키미디어 공용</summary><ul>{people.map(([name,c])=><li key={name}>{name} — <a href={c!.source} target="_blank" rel="noreferrer">{c!.author}</a>, {c!.licenseUrl?<a href={c!.licenseUrl} target="_blank" rel="noreferrer">{c!.license}</a>:c!.license}</li>)}</ul></details>}
   {p.rows.length>0&&<p className="dp-credit">{imageCredits.length>0&&<span className="dp-credit-links">이미지 출처 {imageCredits.map(([label,url])=><a key={label} href={url} target="_blank" rel="noreferrer">{label} ↗</a>)}</span>}이미지는 작품·선수·서비스 식별을 위한 참고 이미지입니다. 사진 촬영 시점과 통계 기준일은 다를 수 있습니다. 각 권리는 원저작자에게 있습니다.</p>}
  </div>
  <aside className="dp-side">
   <div className="dp-card"><small>DATA SOURCE</small><h3>자료 출처</h3>{p.sourceUrl?<a className="dp-source" href={p.sourceUrl} target="_blank" rel="noreferrer">{p.source} ↗</a>:<span className="dp-source static">{p.source}</span>}{!p.noindex&&p.auditNote&&<span className="dp-check"><b>{p.auditDate} 점검</b>{p.auditNote}</span>}</div>
   {related.length>0&&<div className="dp-card"><small>RELATED</small><h3>다른 순위도 둘러보세요</h3><ul>{related.map(x=><li key={x.slug}><a href={`/rankings/${x.slug}`}><span>{x.title}</span><b>→</b></a></li>)}</ul></div>}
  </aside>
 </section>

 {p.faq.length>0&&<section className="dp-wrap dp-faq"><div className="dp-head"><p>FAQ</p><h2>자주 묻는 질문</h2></div>{p.faq.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>}
 <footer className="dp-footer"><div className="dp-wrap"><BrandLogo footer href="/"/><p>자료 기준 {p.date} · 점검 {p.auditDate}</p></div></footer></main>;
}
