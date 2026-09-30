import fs from 'node:fs/promises';
const dir='public/ranking-images/updates';
const m=JSON.parse(await fs.readFile(`${dir}/sources.json`,'utf8'));
const list=[
 ['Shanghai_Tower_photo','https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/20191114_Shanghai_Tower_%282%29.jpg/330px-20191114_Shanghai_Tower_%282%29.jpg','https://commons.wikimedia.org/wiki/File:20191114_Shanghai_Tower_(2).jpg'],
 ['Hyundai_Grandeur_2026','https://www.hyundaimotorgroup.com/image/upload/asset_library/MDA00000000000078837/1112127fd31d43c59135d93454c85727.jpg','https://www.hyundaimotorgroup.com/ko/news/hyundai-new-grandeur-design-reveal'],
 ['Shim_Jung-soo','https://cdn.monthly.chosun.com/news/photo/202210//20221017_5_56360.jpg','https://monthly.chosun.com/news/articleView.html?idxno=56360'],
 ['Dan_Rohrmeier','https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiSlazRoArNz8Mei7wDMldVq-ClFYRUJzcfjDrY2VCE7E9MLdgKNa_HvzXGkVytJTXvyJ4E4xV64ZQfo8WzWvdk9PhltXXRckKX0sh1mEgsTNsVDGCcpDpEfKKQRvGBQlsq8W5RTAUzXgo/s320-rw/GSTL29.jpg','https://www.greatest21days.com/2020/06/dan-rohrmeier-got-paid-to-play-kids.html'],
 ['Gyebangsan','https://tong.visitkorea.or.kr/cms/resource/37/3535037_image2_1.jpg','https://tour.pc.go.kr/Home/H20000/H20200/placeDetail?place_no=10'],
];
for(const [key,url,source] of list){if(m[key])continue;const r=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!r.ok||!r.headers.get('content-type')?.startsWith('image/'))throw Error(`${key} ${r.status}`);const file=`audit-${key}.jpg`;await fs.writeFile(`${dir}/${file}`,Buffer.from(await r.arrayBuffer()));m[key]={image:`/ranking-images/updates/${file}`,original:url,source};console.log('OK',key);await fs.writeFile(`${dir}/sources.json`,JSON.stringify(m,null,2));}
