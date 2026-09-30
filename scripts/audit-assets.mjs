import fs from 'node:fs/promises';
const dir='public/ranking-images/updates';
const manifest=JSON.parse(await fs.readFile(`${dir}/sources.json`,'utf8'));
async function save(key,url,source){
 const r=await fetch(url,{signal:AbortSignal.timeout(20000)});const type=r.headers.get('content-type')||'';
 if(!r.ok||!type.startsWith('image/'))throw Error(`image ${r.status}`);
 const ext=type.includes('png')?'png':type.includes('webp')?'webp':type.includes('svg')?'svg':'jpg';
 const filename=`audit-${key.replace(/[^a-zA-Z0-9-]/g,'_')}.${ext}`;
 await fs.writeFile(`${dir}/${filename}`,Buffer.from(await r.arrayBuffer()));
 manifest[key]={image:`/ranking-images/updates/${filename}`,original:url,source};
 await fs.writeFile(`${dir}/sources.json`,JSON.stringify(manifest,null,2));console.log('OK',key);
}
for(const [key,id] of [['Shim_Jung-soo','94204'],['Dan_Rohrmeier','99724']]){
 try{const source=`https://www.koreabaseball.com/Record/Player/HitterDetail/Basic.aspx?playerId=${id}`;
 const s=await(await fetch(source,{signal:AbortSignal.timeout(20000)})).text();const img=s.match(/<img[^>]+playerProfile_imgProgile[^>]+>/)?.[0];
 const url=img?.match(/\ssrc="([^"]+)"/)?.[1];if(!url)throw Error('no portrait');await save(key,new URL(url,source).href,source);
 }catch(e){console.log('MISSING',key,e.message)}
}
const titles=['Toy_Story_5','Michael_(2026_film)','The_Super_Mario_Galaxy_Movie','Colony_(film)','Hope_(2026_film)','Burj_Khalifa','Merdeka_118','Shanghai_Tower','Abraj_Al_Bait','Ping_An_Finance_Centre','Lotte_World_Tower','Hallasan','Jirisan','Seoraksan','Deogyusan','Gyebangsan','Mount_Everest','K2','Kangchenjunga','Lhotse','Makalu','LG_Twins','Samsung_Lions','Doosan_Bears','Lotte_Giants','Gyeonggi_Province','Seoul','Busan','South_Gyeongsang_Province','Incheon','Sergei_Pavlovich'];
for(const key of titles){if(manifest[key])continue;try{const r=await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(key)}`,{signal:AbortSignal.timeout(15000)});const j=await r.json();if(!j.thumbnail?.source)throw Error('no thumbnail');await save(key,j.thumbnail.source.replace(/\/\d+px-/,'/250px-'),j.content_urls.desktop.page)}catch(e){console.log('MISSING',key,e.message)}await new Promise(r=>setTimeout(r,600))}
const source='https://www.netflix.com/tudum/top10/south-korea/tv';
const s=await(await fetch(source)).text();const cards=[...s.matchAll(/data-uia="top10-card"[^>]*style="background-image:url\(([^)]+)\)/g)].slice(0,10);
if(cards.length!==10)throw Error('Expected ten TV cards');
for(let i=0;i<10;i++)try{await save(`netflix-tv-${i+1}`,cards[i][1].replaceAll('&amp;','&'),source)}catch(e){console.log('MISSING TV',i,e.message)}
