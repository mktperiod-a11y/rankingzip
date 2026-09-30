import fs from 'node:fs/promises';
const dir = 'public/ranking-images/updates';
await fs.mkdir(dir, {recursive:true});
const titles = ['Interstellar_(film)','The_Odyssey_(2026_film)','The_Dark_Knight_Rises','Inception','The_Dark_Knight','Oppenheimer_(film)','Dunkirk_(2017_film)','Tenet_(film)','Spider-Man:_Brand_New_Day','Spider-Man:_No_Way_Home','Spider-Man:_Far_From_Home','Spider-Man_3','Spider-Man:_Homecoming','Spider-Man_(2002_film)','Spider-Man_2','The_Amazing_Spider-Man_(film)','The_Amazing_Spider-Man_2','Spider-Man:_Across_the_Spider-Verse','Spider-Man:_Into_the_Spider-Verse','Lee_Seung-yuop','Shim_Jung-soo','Park_Byung-ho','Lewin_Díaz','Yamaico_Navarro','Eric_Thames','Mel_Rojas_Jr.','Choi_Jeong','Matt_Davidson','Dan_Rohrmeier','Lee_Dae-ho','Kim_Jae-hwan_(baseball)','Jamie_Romak','Tyrone_Woods'];
const assets = JSON.parse(await fs.readFile(`${dir}/sources.json`,'utf8').catch(()=>'{}'));
async function save(key,url){
 const r=await fetch(url); if(!r.ok)throw Error(`${r.status} ${key}`);
 const type=r.headers.get('content-type')||''; if(!type.startsWith('image/'))throw Error(`not image ${key}`);
 const ext=type.includes('png')?'png':type.includes('webp')?'webp':type.includes('svg')?'svg':'jpg';
 const file=`${key.replace(/[^a-zA-Z0-9-]/g,'_')}.${ext}`;
 await fs.writeFile(`${dir}/${file}`,Buffer.from(await r.arrayBuffer()));
 assets[key]={image:`/ranking-images/updates/${file}`,original:url};
}
for(const title of titles.filter(x=>!assets[x])) {
 try {const r=await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`); const j=await r.json(); if(!j.thumbnail?.source)throw Error('no thumbnail'); const url=j.thumbnail.source.replace(/\/\d+px-/,'/250px-'); await save(title,url);assets[title].source=j.content_urls.desktop.page; console.log('OK',title);}catch(e){console.log('MISSING',title,e.message);}
 await new Promise(r=>setTimeout(r,500));
}
const html=await (await fetch('https://www.netflix.com/tudum/top10/south-korea/films')).text();
const imgs=[...html.matchAll(/<img src="([^"]+)" alt="([^"]+)"/g)].slice(0,10);
await Promise.all(imgs.map(async([,url,title],i)=>{if(assets[`netflix-${i+1}`])return;try {await save(`netflix-${i+1}`,url.replaceAll('&amp;','&'));assets[`netflix-${i+1}`].title=title; assets[`netflix-${i+1}`].source='https://www.netflix.com/tudum/top10/south-korea/films';}catch(e){console.log('MISSING',title,e.message)}}));
await fs.writeFile(`${dir}/sources.json`,JSON.stringify(assets,null,2));
console.log('TOTAL',Object.keys(assets).length);
