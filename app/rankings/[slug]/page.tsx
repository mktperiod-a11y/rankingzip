import type { Metadata } from "next";
import { pageBySlug, pages } from "../data";
import { rankingPresentation } from "../presentation";
import shapes from "../../../data/image-shapes.json";
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
type ImageKind = 'flag' | 'logo' | 'photo' | 'photo crest';
const POSTER_SLUGS=["korean-movie-admissions","korea-box-office-2026","worldwide-box-office-2026","ott-content-weekly","netflix-korea-films-weekly"];
const WIDE_POSTER_SLUGS=["ott-content-weekly","netflix-korea-films-weekly"];
const LOGO_SLUGS=["korea-import-car-brands","kbo-team-standings-2026","kbo-attendance-2026","korea-car-sales"];

const offRatio=(src?:string)=>{const r=src&&(shapes as Record<string,number>)[src];return r&&(r<0.6||r>0.78)?"off-ratio":undefined};
function imageKind(slug:string,src:string):ImageKind{
 if(src.includes('flagcdn.com'))return 'flag';
 if(src.includes('/kbo_'))return PERSON_SLUGS.includes(slug)?'photo crest':'logo';
 if(LOGO_SLUGS.includes(slug))return 'logo';
 return 'photo';
}

function numericValues(rows:{value:string}[]){
 const values=rows.map(r=>/위$/.test(r.value.trim())?NaN:Number(r.value.replace(/[$,\s]/g,'').match(/^-?\d+(\.\d+)?/)?.[0]));
 return values.length>1&&values.every(v=>Number.isFinite(v)&&v>=0)&&values.some(v=>v>0)?values:null;
}

const changeBadge=(r:{change?:number|'new'})=>r.change==='new'?<em className="dp-change new">NEW</em>:r.change?<em className={`dp-change ${r.change>0?'up':'down'}`}>{r.change>0?`▲${r.change}`:`▼${-r.change}`}</em>:null;

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
 const podium=!p.unranked&&!p.divisions&&p.rows.length>=3;
 const start=podium?3:0;
 const points=rankingPoints(p.rows,p.unranked?null:numericValues(p.rows));
 const related=pages.filter(x=>!x.noindex&&x.category===p.category&&x.slug!==p.slug).slice(0,4);
 const rowSources=(r:typeof p.rows[number],sub=false)=>p.rowLinkLabel&&r.sourceUrl&&<span className="dp-row-links"><a className={sub?"btn-sub":"dp-visit"} href={r.sourceUrl} target="_blank" rel="noreferrer">{p.rowLinkLabel} <b>→</b></a></span>;
 const presentation=rankingPresentation(p);
 return <main className={`detail-page page-${p.slug}`}>
 {!p.noindex&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:json(schema)}}/>}
 {p.faq.length>0&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:json(faqSchema)}}/>}
 <header className="site-header"><div className="header-inner"><BrandLogo href="/"/><a className="dp-all" href="/#rankings">전체 랭킹 <b>→</b></a></div></header>

 <section className="dp-hero"><div className="dp-wrap dp-hero-inner">
  <div><p className="dp-eyebrow">{p.category} {p.unranked?"GUIDE":"RANKING"}</p><h1>{p.title}</h1><p className="dp-desc">{p.description}</p><p className="dp-meta"><span><b>기준</b>{presentation.basis}</span>{presentation.updated&&<span><b>업데이트</b>{presentation.updated}</span>}</p></div>
 </div></section>
 {p.noindex&&p.holdReason&&<div className="dp-wrap"><section className="dp-audit pending"><b>검증 보류</b><p>{p.holdReason}</p></section></div>}

 {p.divisions&&<section className="dp-wrap dp-divisions"><div className="dp-head"><p>WEIGHT CLASSES</p><h2>체급별 챔피언과 랭커</h2><span>각 체급의 챔피언과 상위 3명입니다. 챔피언은 랭커 1위와 별도입니다.</span></div><div className="dp-division-grid">{p.divisions.map(d=><article className="dp-division" key={d.name}><h3>{d.name}</h3><div className="dp-champion">{portrait(d.champion)?<img src={portrait(d.champion)} alt={`${d.champion} ${d.name} 챔피언`} loading="lazy"/>:<span className="dp-initial">{d.champion.slice(0,1)}</span>}<div><i>CHAMPION</i><strong>{d.champion}</strong></div></div><ol>{d.contenders.map((x,i)=><li key={x}>{portrait(x)?<img src={portrait(x)} alt={`${x} ${d.name} ${i+1}위`} loading="lazy"/>:<span className="dp-initial">{x.slice(0,1)}</span>}<b>{i+1}</b><span>{x}</span></li>)}</ol></article>)}</div></section>}

 <section className="dp-wrap dp-body">
  <div className="dp-main">
   <div className="dp-head"><p>{p.unranked?"REFERENCE":"RANKING"}</p><h2>{p.divisions?"체급을 대표하는 주요 선수":p.unranked?"자료 안내":"순위 한눈에 보기"}</h2>{!p.unranked&&p.rows.length>0&&<span>{p.rows.length}개 항목</span>}</div>
   {!p.rows.length&&<p className="dp-empty">확인되지 않은 수치와 순위는 공개하지 않습니다. 검증 가능한 원자료 확보 후 다시 제공합니다.</p>}
   {!p.noindex&&rankingCountExceptions[p.slug]&&<p className="dp-count-note">{rankingCountExceptions[p.slug]}</p>}
   {points.length>0&&<p className="dp-lede">{points.join(" · ")}</p>}
   {podium&&<ol className={`dp-podium ${poster?'poster':''}${wide}`}>{[1,0,2].map(i=>{const r=p.rows[i];const image=r.image||imageByName[r.name];const rank=r.rank??i+1;return <li key={r.name} className={`place-${i+1}`}><div className={poster?'dp-podium-poster':`dp-thumb ${imageKind(p.slug,image||'')}${image?'':' none'}`}>{image?<img src={image} className={offRatio(image)} alt={`${r.name} 대표 이미지`} loading="lazy"/>:<span>{r.name.slice(0,1)}</span>}</div><div className="dp-step"><b className="dp-medal">{rank}</b><h3>{r.name}{changeBadge(r)}</h3>{r.value&&<strong>{presentation.valueLabel&&<small className="dp-value-label">{presentation.valueLabel}</small>}{r.value}</strong>}{rowSources(r)}</div></li>})}</ol>}
   {poster&&!podium?<ol className={`dp-posters${wide}`} start={start+1}>{p.rows.slice(start).map((r,k)=>{const i=k+start;const image=r.image||imageByName[r.name];return <li key={r.name}><div className="dp-poster">{image?<img src={image} className={offRatio(image)} alt={`${r.name} 포스터`} loading="lazy"/>:<span className="dp-noimg">이미지 준비 중</span>}{!p.unranked&&<b className={`dp-rank ${(r.rank??i+1)<=3?'top':''}`}>{r.rank??i+1}</b>}</div><h3>{r.name}{changeBadge(r)}</h3><strong>{presentation.valueLabel&&<small className="dp-value-label">{presentation.valueLabel}</small>}{r.value}</strong>{presentation.notes[i]&&<p>{presentation.notes[i]}</p>}{rowSources(r,true)}</li>})}</ol>
   :<ol className={`dp-list${poster?` media-list${wide}`:""}`} start={start+1}>{p.rows.slice(start).map((r,k)=>{const i=k+start;const image=r.image||imageByName[r.name];const rank=r.rank??i+1;return <li key={r.name} className={!p.unranked&&rank<=3?'top':''}>{!p.unranked&&<b className="dp-rank">{rank}</b>}<div className={`dp-thumb ${imageKind(p.slug,image||'')}${image?'':' none'}`}>{image?<img src={image} className={offRatio(image)} alt={`${r.name} 대표 이미지`} loading="lazy"/>:<span>{r.name.slice(0,1)}</span>}</div><div className="dp-info"><div className="dp-line"><h3>{r.name}{changeBadge(r)}</h3>{r.value&&<strong>{presentation.valueLabel&&<small className="dp-value-label">{presentation.valueLabel}</small>}{r.value}</strong>}</div>{values&&<div className="dp-bar" aria-hidden="true"><i style={{width:`${values[i]?Math.max(2,values[i]/max*100):0}%`}}/></div>}{presentation.notes[i]&&<p>{presentation.notes[i]}</p>}{rowSources(r,true)}</div></li>})}</ol>}
   
   {p.rows.length>0&&<p className="dp-credit">이미지는 작품·선수·서비스 식별을 위한 참고 이미지입니다. 사진 촬영 시점과 통계 기준일은 다를 수 있습니다. 각 권리는 원저작자에게 있습니다.</p>}
  </div>
  <aside className="dp-side">
   <div className="dp-card"><small>DATA SOURCE</small><h3>자료 출처</h3>{p.sourceUrl?<a className="dp-source" href={p.sourceUrl} target="_blank" rel="noreferrer">{p.source} ↗</a>:<span className="dp-source static">{p.source}</span>}</div>
   {related.length>0&&<div className="dp-card"><small>RELATED</small><h3>다른 순위도 둘러보세요</h3><ul>{related.map(x=><li key={x.slug}><a href={`/rankings/${x.slug}`}><span>{x.title}</span><b>→</b></a></li>)}</ul></div>}
  </aside>
 </section>

 {p.faq.length>0&&<section className="dp-wrap dp-faq"><div className="dp-head"><p>FAQ</p><h2>자주 묻는 질문</h2></div>{p.faq.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>}
 <footer className="dp-footer"><div className="dp-wrap"><BrandLogo footer href="/"/></div></footer></main>;
}
