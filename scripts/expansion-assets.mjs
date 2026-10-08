import fs from 'node:fs/promises';
import sharp from 'sharp';
const dir='public/ranking-images/expansion';
await fs.mkdir(dir,{recursive:true});
const players=[52605,53123,56034,68050,69737,54400];
const brands={tesla:'edit-images/brand/img_tesla.jpg',bmw:'edit-images/brand/img_bmw.jpg',mercedes:'edit-images/brand/img_mercedes-benz.jpg',byd:'edit-images/brand/img_byd.png',lexus:'images_renew/brand/img_lexus_new2.png',toyota:'edit-images/brand/img_toyota_new.jpg',volvo:'edit-images/brand/img_volvo.jpg',audi:'edit-images/brand/img_audi.jpg',porsche:'edit-images/brand/img_porsche.jpg',mini:'edit-images/brand/img_mini.jpg'};
const items=[...players.map(id=>[String(id),`https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE/person/middle/2026/${id}.jpg`,`https://www.koreabaseball.com/Record/Player/HitterBasic/Basic1.aspx`]),...Object.entries(brands).map(([key,p])=>[key,'https://www.kaida.co.kr/'+p,'https://www.kaida.co.kr/ko/brand/BrandMain.do'])];
const result=JSON.parse(await fs.readFile(`${dir}/sources.json`,'utf8').catch(()=>'{}'));
await Promise.all(items.map(async([key,url,source])=>{
 const r=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!r.ok)throw Error(`${key}: ${r.status}`);
 const bytes=Buffer.from(await r.arrayBuffer());const meta=await sharp(bytes).metadata();if(!meta.width||meta.width<50)throw Error(`Invalid ${key}`);
 await sharp(bytes).webp({quality:90}).toFile(`${dir}/${key}.webp`);
 result[key]={image:`/ranking-images/expansion/${key}.webp`,source,original:url,width:meta.width,height:meta.height,checked:'2026-08-27'};console.log(key,meta.width,meta.height);
}));
await fs.writeFile(`${dir}/sources.json`,JSON.stringify(result,null,2)+'\n');
