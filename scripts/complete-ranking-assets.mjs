import fs from 'node:fs/promises';
const dir='public/ranking-images/updates';
const assets=JSON.parse(await fs.readFile(`${dir}/sources.json`,'utf8'));
async function save(key,url,source){const r=await fetch(url);if(!r.ok||!r.headers.get('content-type')?.startsWith('image/'))throw Error(`image ${key} ${r.status}`);const file=`${key}.jpg`;await fs.writeFile(`${dir}/${file}`,Buffer.from(await r.arrayBuffer()));assets[key]={image:`/ranking-images/updates/${file}`,original:url,source};console.log('OK',key);}
const source='https://www.netflix.com/tudum/top10/south-korea/films';
const html=await(await fetch(source)).text();
const cards=[...html.matchAll(/data-uia="top10-card"[^>]*style="background-image:url\(([^)]+)\)/g)].slice(0,10);
if(cards.length!==10)throw Error('Expected ten Netflix artworks');
for(let i=0;i<cards.length;i++)await save(`netflix-art-${i+1}`,cards[i][1].replaceAll('&amp;','&'),source);
for(const [key,id] of [['Matt_Davidson','54944'],['Kim_Jae-hwan_(baseball)','78224']]){
 const page=`https://web1.koreabaseball.com/Record/Player/HitterDetail/Basic.aspx?playerId=${id}`;
 const s=await(await fetch(page)).text();const img=[...s.matchAll(/<img[^>]+>/g)].find(x=>x[0].includes('playerProfile_imgProgile'))?.[0];const url=img?.match(/\ssrc="([^"]+)"/)?.[1];
 if(url)await save(key,url.startsWith('//')?'https:'+url:url,page);
}
await fs.writeFile(`${dir}/sources.json`,JSON.stringify(assets,null,2));
