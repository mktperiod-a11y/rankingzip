import fs from 'node:fs/promises';
import path from 'node:path';

const pages=[
 ['films','https://www.netflix.com/tudum/top10/south-korea/films','netflix-art'],
 ['tv','https://www.netflix.com/tudum/top10/south-korea/tv','netflix-tv'],
];
const out=path.resolve('public/ranking-images/updates');
for(const [,url,prefix] of pages){
 const html=await (await fetch(url,{headers:{'user-agent':'Mozilla/5.0'}})).text();
 const urls=[...html.matchAll(/data-uia="top10-card"[^>]*style="background-image:url\(([^)]+)\)/g)].slice(0,10).map(x=>x[1]);
 if(urls.length!==10)throw new Error(`${prefix}: expected 10 images, got ${urls.length}`);
 for(let i=0;i<urls.length;i++){
  const response=await fetch(urls[i]);
  if(!response.ok)throw new Error(`${prefix}-${i+1}: ${response.status}`);
  await fs.writeFile(path.join(out,`${prefix}-${i+1}.jpg`),Buffer.from(await response.arrayBuffer()));
 }
}
console.log('Refreshed 20 official Netflix chart images.');
const porter=await fetch('https://www.hyundai.com/contents/repn-car/side-45/porter2-26my-45side.png');
if(!porter.ok)throw new Error(`porter2: ${porter.status}`);
await fs.mkdir(path.resolve('public/ranking-images/cars'),{recursive:true});
await fs.writeFile(path.resolve('public/ranking-images/cars/porter2.png'),Buffer.from(await porter.arrayBuffer()));
