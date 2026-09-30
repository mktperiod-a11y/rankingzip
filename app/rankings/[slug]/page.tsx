import type { Metadata } from "next";
import { pageBySlug, pages } from "../data";
import assets from '../../../public/ranking-images/updates/sources.json';
import { notFound } from 'next/navigation';
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
 "온디스크":"/ranking-images/services/ondisk.png","케이디스크":"/ranking-images/services/kdisk.png","파일스타":"/ranking-images/services/filestar.png","파일마루":"/ranking-images/services/filemaru.png","예스파일":"/ranking-images/services/yesfile.png",
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
export default async function RankingDetail({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const p=pageBySlug[slug];if(!p)notFound();
 const schema={"@context":"https://schema.org","@type":"ItemList",name:p.title,description:p.description,numberOfItems:p.rows.length,itemListOrder:p.unranked?"https://schema.org/ItemListUnordered":"https://schema.org/ItemListOrderAscending",itemListElement:p.rows.map((r,i)=>({"@type":"ListItem",position:r.rank??i+1,name:r.name,description:`${r.value} · ${r.note}`}))};
 const faqSchema={"@context":"https://schema.org","@type":"FAQPage",mainEntity:p.faq.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))};
 const json=(value:unknown)=>JSON.stringify(value).replace(/</g,'\\u003c');
 return <main className={`detail-page page-${p.slug}`}>
 {!p.noindex&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:json(schema)}}/>}
 <script type="application/ld+json" dangerouslySetInnerHTML={{__html:json(faqSchema)}}/>
 <header className="detail-header"><a href="/" className="detail-logo"><span>⌂</span>순위<b>ZIP</b></a><a href="/">전체 랭킹</a></header>
 <section className="detail-hero"><div><p>{p.category} {p.unranked?"GUIDE":"RANKING"}</p><h1>{p.title}</h1><span>{p.description}</span><div className="detail-meta"><b>자료 기준 {p.date}</b><b>{p.basis}</b></div></div>{!p.unranked&&<div className="hero-number">TOP<br/><strong>{p.rows.length}</strong></div>}</section>
 <section className={`audit-notice ${p.noindex?'audit-pending':''}`}><b>{p.auditDate} 자료 점검</b><p>{p.auditNote}</p></section>
 {p.divisions&&<section className="division-section"><div className="section-title"><p>WEIGHT CLASSES</p><h2>남성부 체급별 챔피언과 랭커</h2><span>각 체급의 챔피언과 상위 3명입니다. 챔피언은 랭커 1위와 별도입니다.</span></div><div className="division-grid">{p.divisions.map(d=><article className="division-card" key={d.name}><div className="division-name">{d.name}</div><div className="champion"><img src={portrait(d.champion)} alt={`${d.champion} ${d.name} 챔피언`}/><div><i>CHAMPION</i><h3>{d.champion}</h3></div></div><div className="contenders">{d.contenders.map((x,i)=><div className="fighter" key={x}><img src={portrait(x)} alt={`${x} ${d.name} ${i+1}위`}/><b>{i+1}</b><span>{x}</span></div>)}</div></article>)}</div></section>}
 <section className="detail-content"><div className={`ranking-list ${(p.posterLayout||["korean-movie-admissions","korea-box-office-2026","worldwide-box-office-2026","korean-drama-ratings","ott-content-weekly"].includes(p.slug))?"poster-list":""} ${p.slug==="korea-ott-users"?"logo-list":""}`}><div className="section-title"><p>{p.unranked?"REFERENCE":"TOP RANKING"}</p><h2>{p.divisions?"체급을 대표하는 주요 선수":p.unranked?"자료 안내":"순위 한눈에 보기"}</h2></div><div className="ranking-items">
 {!p.rows.length&&<p>확인되지 않은 수치와 순위는 공개하지 않습니다. 검증 가능한 원자료 확보 후 다시 제공합니다.</p>}
 {p.rows.map((r,i)=>{const image=r.image||imageByName[r.name];return <article className="detail-row" key={r.name}>{image?<img src={image} alt={`${r.name} 대표 이미지`} loading="lazy"/>:<div className="image-placeholder" aria-label="확인 가능한 사진 준비 중">사진<br/>준비 중</div>}{!p.unranked&&<b className="position">{r.rank??i+1}</b>}<div><h3>{r.name}</h3><p>{r.note}</p>{r.sourceUrl&&<a className="row-source" href={r.sourceUrl} target="_blank" rel="noreferrer">{p.unranked?"공식·참고 안내":"자료 출처"} ↗</a>}{r.imageSource&&<a className="row-source" href={r.imageSource} target="_blank" rel="noreferrer">이미지 출처 ↗</a>}</div><strong>{r.value}</strong></article>})}</div><p className="image-credit">이미지는 작품·선수·서비스 식별을 위한 참고 이미지입니다. 사진 촬영 시점과 통계 기준일은 다를 수 있습니다. 각 권리는 원저작자에게 있습니다.</p></div>
 <aside><div className="source-card"><small>DATA SOURCE</small><h3>자료와 집계 기준</h3><p>{p.basis}</p><a href={p.sourceUrl} target="_blank" rel="noreferrer">{p.source} ↗</a><span>자료 기준일과 사이트 점검일은 다릅니다. 과거 통계는 현재 순위로 해석하지 마세요.</span></div><div className="related-card"><small>RELATED</small><h3>다른 순위도 둘러보세요</h3>{pages.filter(x=>!x.noindex&&x.category===p.category&&x.slug!==p.slug).slice(0,4).map(x=><a key={x.slug} href={`/rankings/${x.slug}`}>{x.title} →</a>)}</div></aside></section>
 <section className="faq-section"><div className="section-title"><p>FAQ</p><h2>자주 묻는 질문</h2></div>{p.faq.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section><footer className="detail-footer"><a href="/">순위ZIP 홈으로 돌아가기</a><p>자료 기준: {p.date} · 점검: {p.auditDate}</p></footer></main>;
}
