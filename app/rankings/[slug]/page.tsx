import type { Metadata } from "next";
import { pageBySlug, pages } from "../data";
import assets from '../../../public/ranking-images/updates/sources.json';
import { notFound } from 'next/navigation';
import { BrandLogo } from '../../brand-logo';
import "./ranking.css";

export const imageByName: Record<string,string> = {
 "조슈아 반":"/ranking-images/ufc/joshua-van.jpg","알렉산드레 판토자":"/ranking-images/ufc/alexandre-pantoja.jpg","마넬 케이프":"/ranking-images/ufc/manel-kape.jpg","브랜든 로이발":"/ranking-images/ufc/brandon-royval.jpg",
 "페트르 얀":"/ranking-images/ufc/petr-yan.jpg","메랍 드발리시빌리":"/ranking-images/ufc/merab-dvalishvili.jpg","션 오말리":"/ranking-images/ufc/sean-omalley.jpg","우마르 누르마고메도프":"/ranking-images/ufc/umar-nurmagomedov.jpg",
 "알렉산더 볼카노프스키":"/ranking-images/ufc/alexander-volkanovski.jpg","모브사르 에블로예프":"/ranking-images/ufc/movsar-evloev.jpg","디에고 로페스":"/ranking-images/ufc/diego-lopes.jpg","레론 머피":"/ranking-images/ufc/lerone-murphy.jpg",
 "저스틴 게이치":"/ranking-images/ufc/justin-gaethje.jpg","일리아 토푸리아":"/ranking-images/ufc/ilia-topuria.jpg","아르만 사루키안":"/ranking-images/ufc/arman-tsarukyan.jpg","찰스 올리베이라":"/ranking-images/ufc/charles-oliveira.jpg",
 "이슬람 마카체프":"/ranking-images/ufc/islam-makhachev.jpg","이안 마차도 개리":"/ranking-images/ufc/ian-garry.jpg","카를로스 프라치스":"/ranking-images/ufc/carlos-prates.jpg","마이클 모랄레스":"/ranking-images/ufc/michael-morales.jpg",
 "션 스트릭랜드":"/ranking-images/ufc/sean-strickland.jpg","함자트 치마예프":"/ranking-images/ufc/khamzat-chimaev.jpg","드리커스 뒤 플레시":"/ranking-images/ufc/dricus-du-plessis.jpg","나수르딘 이마보프":"/ranking-images/ufc/nassourdine-imavov.jpg",
 "카를로스 울버그":"/ranking-images/ufc/carlos-ulberg.jpg","마고메드 안칼라예프":"/ranking-images/ufc/magomed-ankalaev.jpg","유리 프로하스카":"/ranking-images/ufc/jiri-prochazka.jpg","알렉스 페레이라":"/ranking-images/ufc/alex-pereira.jpg",
 "톰 아스피날":"/ranking-images/ufc/tom-aspinall.jpg","시릴 간":"/ranking-images/ufc/ciryl-gane.jpg","알렉산더 볼코프":"/ranking-images/ufc/alexander-volkov.jpg","커티스 블레이즈":"/ranking-images/ufc/curtis-blaydes.jpg",
 "첫사랑":"/ranking-images/drama/first-love.jpg","허준":"/ranking-images/drama/hur-jun.jpg","모래시계":"/ranking-images/drama/sandglass.jpg","사랑이 뭐길래":"/ranking-images/drama/what-is-love.jpg","젊은이의 양지":"/ranking-images/drama/sunny-place.jpg",
 "왕과 사는 남자":"/ranking-images/posters/kings-warden.png","나는 SOLO":"/ranking-images/posters/i-am-solo.jpg","우리의 끈끈한 사랑":"/ranking-images/posters/you-everything.jpg","귀신들린 연애":"/ranking-images/posters/possessed-love.jpg","불량연애":"/ranking-images/posters/badly-in-love.jpg","아파트 잡":"/ranking-images/posters/apartment-job.jpg",
 "더 뉴 그랜저":"/ranking-images/cars/grandeur.jpg","셀토스":"/ranking-images/cars/seltos.png","카니발":"/ranking-images/cars/carnival.png","쏘렌토":"/ranking-images/cars/sorento.png","스포티지":"/ranking-images/cars/sportage.png","포터2":"/ranking-images/cars/porter2.png",
 "김병현":"/ranking-images/people/kim-byung-hyun.jpg","김하성":"/ranking-images/people/ha-seong-kim.jpg","황희찬":"/ranking-images/people/hwang-hee-chan.jpg","이재성":"/ranking-images/people/lee-jae-sung.jpg",
 "일본":"/ranking-images/travel/japan.jpg","베트남":"/ranking-images/travel/vietnam.jpg","중국":"/ranking-images/travel/china.jpg","태국":"/ranking-images/travel/thailand.jpg","대만":"/ranking-images/travel/taiwan.jpg",
 "온디스크":"/ranking-images/services/ondisk.png","케이디스크":"/ranking-images/services/kdisk.png","파일스타":"/ranking-images/services/filestar.png","파일마루":"/ranking-images/services/filemaru.png","예스파일":"/ranking-images/services/yesfile.png","파일조":"/ranking-images/services/filejo.png","파일이즈":"/ranking-images/services/fileis.svg","빅파일":"/ranking-images/services/bigfile.png",
 "넷플릭스":"/ranking-images/ott/netflix.svg","쿠팡플레이":"/ranking-images/ott/coupangplay.webp","티빙":"/ranking-images/ott/tving.ico","웨이브":"/ranking-images/ott/wavve.ico","디즈니+":"/ranking-images/ott/disneyplus.png",
 "카와키타 사이카":"/ranking-images/people/saika-kawakita.jpg","이시카와 미오":"/ranking-images/people/mio-ishikawa.jpg","코이부치 모모나":"/ranking-images/people/momona-koibuchi.jpg","야기 나나":"/ranking-images/people/nana-yagi.jpg","미카미 유아":"/ranking-images/people/yua-mikami.jpg",
 "크리스티아누 호날두":"/ranking-images/people/ronaldo.jpg","스테픈 커리":"/ranking-images/people/stephen-curry.jpg","타이슨 퓨리":"/ranking-images/people/tyson-fury.jpg","닥 프레스콧":"/ranking-images/people/dak-prescott.jpg","리오넬 메시":"/ranking-images/people/lionel-messi.jpg"
};

const portrait=(name:string)=>name==='세르게이 파블로비치'?(assets as Record<string,{image:string}>).Sergei_Pavlovich?.image:imageByName[name];
export function generateStaticParams(){return pages.map(p=>({slug:p.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;const p=pageBySlug[slug];if(!p)return {};
 const firstImage=p.rows[0]?.image||imageByName[p.rows[0]?.name];
 return {title:`${p.title} | 순위ZIP`,description:p.description,robots:p.noindex?{index:false,follow:true}:undefined,alternates:{canonical:`/rankings/${slug}`},openGraph:{title:p.title,description:p.description,type:"article",url:`/rankings/${slug}`,images:firstImage?[{url:firstImage}]:[]},twitter:{card:"summary_large_image",title:p.title,description:p.description,images:firstImage?[firstImage]:[]}};
}
type ImageKind = 'flag' | 'logo' | 'photo';
const POSTER_SLUGS=["korean-movie-admissions","korea-box-office-2026","worldwide-box-office-2026","korean-drama-ratings","ott-content-weekly"];
// 로고·차량처럼 잘리면 안 되는 이미지를 쓰는 순위는 흰 바탕 틀 안에 전체가 보이게 맞춥니다.
const LOGO_SLUGS=["korea-ott-users","file-sharing-services","korea-import-car-brands","kbo-team-standings-2026","kbo-attendance-2026","korea-car-sales"];

/** 이미지 종류마다 틀 비율이 다릅니다. 국기는 3:2, 로고·차량은 흰 바탕에 전체가 보이게, 인물·장소 사진은 정사각형을 꽉 채웁니다. 포스터는 별도 2:3 카드입니다. */
function imageKind(slug:string,src:string):ImageKind{
 if(src.includes('flagcdn.com'))return 'flag';
 if(LOGO_SLUGS.includes(slug))return 'logo';
 return 'photo';
}

/** "32,383.920십억 달러", "$2,332,507,928", "56홈런"처럼 앞에 숫자가 있는 값만 막대 비교에 씁니다. 등수("3위") 값은 제외합니다. */
function numericValues(rows:{value:string}[]){
 const values=rows.map(r=>/위$/.test(r.value.trim())?NaN:Number(r.value.replace(/[$,\s]/g,'').match(/^-?\d+(\.\d+)?/)?.[0]));
 return values.length>1&&values.every(v=>Number.isFinite(v)&&v>=0)&&values.some(v=>v>0)?values:null;
}

export default async function RankingDetail({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const p=pageBySlug[slug];if(!p)notFound();
 const schema={"@context":"https://schema.org","@type":"ItemList",name:p.title,description:p.description,numberOfItems:p.rows.length,itemListOrder:p.unranked?"https://schema.org/ItemListUnordered":"https://schema.org/ItemListOrderAscending",itemListElement:p.rows.map((r,i)=>({"@type":"ListItem",position:r.rank??i+1,name:r.name,description:`${r.value} · ${r.note}`}))};
 const faqSchema={"@context":"https://schema.org","@type":"FAQPage",mainEntity:p.faq.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))};
 const json=(value:unknown)=>JSON.stringify(value).replace(/</g,'\\u003c');
 const poster=p.posterLayout||POSTER_SLUGS.includes(p.slug);
 const values=p.unranked||p.hideBars?null:numericValues(p.rows);
 const max=values?Math.max(...values):0;
 const related=pages.filter(x=>!x.noindex&&x.category===p.category&&x.slug!==p.slug).slice(0,4);
 const rowSources=(r:typeof p.rows[number])=>(r.sourceUrl||r.imageSource)&&<span className="dp-row-links">{r.sourceUrl&&(p.rowLinkLabel?<a className="dp-visit" href={r.sourceUrl} target="_blank" rel="noreferrer">{p.rowLinkLabel} →</a>:<a href={r.sourceUrl} target="_blank" rel="noreferrer">{p.unranked?"공식·참고 안내":"자료 출처"} ↗</a>)}{r.imageSource&&<a href={r.imageSource} target="_blank" rel="noreferrer">이미지 출처 ↗</a>}</span>;
 return <main className={`detail-page page-${p.slug}`}>
 {!p.noindex&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:json(schema)}}/>}
 {p.faq.length>0&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:json(faqSchema)}}/>}
 <header className="site-header"><div className="header-inner"><BrandLogo href="/"/><a className="dp-all" href="/#rankings">전체 랭킹 <b>→</b></a></div></header>

 <section className="dp-hero"><div className="dp-wrap dp-hero-inner">
  <div><p className="dp-eyebrow">{p.category} {p.unranked?"GUIDE":"RANKING"}</p><h1>{p.title}</h1><p className="dp-desc">{p.description}</p><div className="dp-chips"><b>자료 기준 {p.date}</b><b>{p.basis}</b></div></div>
  {!p.unranked&&p.rows.length>0&&<div className="dp-count">TOP<strong>{p.rows.length}</strong></div>}
 </div></section>
 {p.auditNote&&<div className="dp-wrap"><section className={`dp-audit ${p.noindex?'pending':''}`}><b>{p.auditDate} {p.noindex?'검증 보류':'자료 점검'}</b><p>{p.auditNote}</p></section></div>}

 {p.divisions&&<section className="dp-wrap dp-divisions"><div className="dp-head"><p>WEIGHT CLASSES</p><h2>체급별 챔피언과 랭커</h2><span>각 체급의 챔피언과 상위 3명입니다. 챔피언은 랭커 1위와 별도입니다.</span></div><div className="dp-division-grid">{p.divisions.map(d=><article className="dp-division" key={d.name}><h3>{d.name}</h3><div className="dp-champion"><img src={portrait(d.champion)} alt={`${d.champion} ${d.name} 챔피언`} loading="lazy"/><div><i>CHAMPION</i><strong>{d.champion}</strong></div></div><ol>{d.contenders.map((x,i)=><li key={x}><img src={portrait(x)} alt={`${x} ${d.name} ${i+1}위`} loading="lazy"/><b>{i+1}</b><span>{x}</span></li>)}</ol></article>)}</div></section>}

 <section className="dp-wrap dp-body">
  <div className="dp-main">
   <div className="dp-head"><p>{p.unranked?"REFERENCE":"RANKING"}</p><h2>{p.divisions?"체급을 대표하는 주요 선수":p.unranked?"자료 안내":"순위 한눈에 보기"}</h2>{!p.unranked&&p.rows.length>0&&<span>{p.rows.length}개 항목</span>}</div>
   {!p.rows.length&&<p className="dp-empty">확인되지 않은 수치와 순위는 공개하지 않습니다. 검증 가능한 원자료 확보 후 다시 제공합니다.</p>}
   {poster?<ol className="dp-posters">{p.rows.map((r,i)=>{const image=r.image||imageByName[r.name];return <li key={r.name}><div className="dp-poster">{image?<img src={image} alt={`${r.name} 포스터`} loading="lazy"/>:<span className="dp-noimg">이미지 준비 중</span>}{!p.unranked&&<b className={`dp-rank ${(r.rank??i+1)<=3?'top':''}`}>{r.rank??i+1}</b>}</div><h3>{r.name}</h3><strong>{r.value}</strong><p>{r.note}</p>{rowSources(r)}</li>})}</ol>
   :<ol className="dp-list">{p.rows.map((r,i)=>{const image=r.image||imageByName[r.name];const rank=r.rank??i+1;return <li key={r.name} className={!p.unranked&&rank<=3?'top':''}>{!p.unranked&&<b className="dp-rank">{rank}</b>}<div className={`dp-thumb ${imageKind(p.slug,image||'')}${image?'':' none'}`}>{image?<img src={image} alt={`${r.name} 대표 이미지`} loading="lazy"/>:<span>{r.name.slice(0,1)}</span>}</div><div className="dp-info"><div className="dp-line"><h3>{r.name}</h3><strong>{r.value}</strong></div>{values&&<div className="dp-bar" aria-hidden="true"><i style={{width:`${values[i]?Math.max(2,values[i]/max*100):0}%`}}/></div>}<p>{r.note}</p>{rowSources(r)}</div></li>})}</ol>}
   {p.rows.length>0&&<p className="dp-credit">이미지는 작품·선수·서비스 식별을 위한 참고 이미지입니다. 사진 촬영 시점과 통계 기준일은 다를 수 있습니다. 각 권리는 원저작자에게 있습니다.</p>}
  </div>
  <aside className="dp-side">
   <div className="dp-card"><small>DATA SOURCE</small><h3>자료와 집계 기준</h3><p>{p.basis}</p>{p.sourceUrl?<a className="dp-source" href={p.sourceUrl} target="_blank" rel="noreferrer">{p.source} ↗</a>:<span className="dp-source static">{p.source}</span>}<span>자료 기준일과 사이트 점검일은 다릅니다. 과거 통계는 현재 순위로 해석하지 마세요.</span></div>
   {related.length>0&&<div className="dp-card"><small>RELATED</small><h3>다른 순위도 둘러보세요</h3><ul>{related.map(x=><li key={x.slug}><a href={`/rankings/${x.slug}`}><span>{x.title}</span><b>→</b></a></li>)}</ul></div>}
  </aside>
 </section>

 {p.faq.length>0&&<section className="dp-wrap dp-faq"><div className="dp-head"><p>FAQ</p><h2>자주 묻는 질문</h2></div>{p.faq.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>}
 <footer className="dp-footer"><div className="dp-wrap"><BrandLogo footer href="/"/><p>자료 기준 {p.date} · 점검 {p.auditDate}</p></div></footer></main>;
}
