import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import test from 'node:test';
import assert from 'node:assert/strict';
const cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));const scope={exports:{},require:(name)=>load(path.resolve(path.dirname(file),name)+(name.endsWith('.json')?'':'.ts'))};cache.set(file,scope.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,scope);return scope.exports;}
const {pages}=load('app/rankings/data.ts');
const detail=fs.readFileSync('app/rankings/[slug]/page.tsx','utf8');
const map=JSON.parse(detail.match(/export const imageByName[^=]*= (\{[\s\S]*?\n\});/)[1]);
test('all 38 pages have explicit audit decisions and no broken local row images',()=>{
 assert.equal(pages.length,38);assert.equal(new Set(pages.map(p=>p.slug)).size,38);
 for(const p of pages){assert.ok(p.auditDate,p.slug);for(const r of p.rows){const src=r.image||map[r.name];if(!src)continue;
 assert.ok(src,`${p.slug}: missing ${r.name}`);if(src.startsWith('/'))assert.ok(fs.statSync('public'+src).size>100,src);assert.ok(!src.includes('unsplash'),`unverified stock image ${p.slug}`);}}
});
test('new season rankings and imported brands are complete and linked',()=>{
 const by=Object.fromEntries(pages.map(p=>[p.slug,p]));
 const hr=by['kbo-home-runs-2026'],rbi=by['kbo-rbi-2026'],cars=by['korea-import-car-brands'];
 const live=(slug)=>JSON.parse(fs.readFileSync(`data/rankings/live/${slug}.json`,'utf8'));
 assert.deepEqual(Array.from(hr.rows,r=>r.value),live('kbo-home-runs-2026').rows.map(r=>`${r.value}홈런`));
 assert.deepEqual(Array.from(rbi.rows,r=>r.value),live('kbo-rbi-2026').rows.map(r=>`${r.value}타점`));
 assert.equal(cars.rows.length,10);
 const kaida=live('korea-import-car-brands');assert.deepEqual(Array.from(cars.rows,r=>r.value),kaida.rows.map(r=>`${r.count.toLocaleString('en-US')}대`));assert.match(cars.rows[0].note,new RegExp(`${kaida.rows[0].share.toFixed(1)}%`));
 const {slugByTitle}=load('app/rankings/data.ts');
 const home=fs.readFileSync('app/home.tsx','utf8');
 for(const p of [hr,rbi,cars]){assert.equal(slugByTitle[p.title],p.slug);assert.ok(home.includes(p.title));assert.ok(p.faq.length>=2);}
 for(const r of cars.rows){assert.ok(r.sourceUrl);if(r.image)assert.ok(r.image.startsWith('/ranking-images/expansion/')&&r.imageSource);}
 const credits=JSON.parse(fs.readFileSync('public/ranking-images/portraits/credits.json','utf8'));
 for(const r of [...hr.rows,...rbi.rows]){assert.ok(r.sourceUrl);const c=credits[r.name];if(c){assert.equal(r.image,c.image);assert.ok(c.author&&c.license&&c.source);}else assert.match(r.image,/^\/ranking-images\/expansion\/kbo_\w+\.webp$/);assert.ok(fs.existsSync(`public${r.image}`));}
});
test('auto-updated rankings show exactly the collected source data',()=>{
 const by=Object.fromEntries(pages.map(p=>[p.slug,p]));
 const live=(slug)=>JSON.parse(fs.readFileSync(`data/rankings/live/${slug}.json`,'utf8'));
 const fmt=(n)=>n.toLocaleString('en-US');
 const teams=by['kbo-team-standings-2026'];assert.deepEqual(Array.from(teams.rows,r=>r.name),live('kbo-team-standings-2026').rows.map(r=>r.team));
 for(const slug of ['korea-box-office-2026','korean-movie-admissions'])assert.deepEqual(Array.from(by[slug].rows,r=>[r.name,r.value]),live(slug).rows.map(r=>[r.title,`${fmt(r.audience)}명`]));
 assert.deepEqual(Array.from(by['worldwide-box-office-2026'].rows,r=>r.value),live('worldwide-box-office-2026').rows.map(r=>`$${fmt(r.gross)}`));
 assert.deepEqual(Array.from(by['spider-man-worldwide-box-office'].rows,r=>r.value),live('spider-man-worldwide-box-office').rows.map(r=>`$${fmt(r.gross)}`));
 assert.deepEqual(Array.from(by['korea-car-sales'].rows,r=>[r.name,r.value]),live('korea-car-sales').rows.map(r=>[r.name,`${fmt(r.sales)}대`]));
 assert.deepEqual(Array.from(by['korea-pc-games-share'].rows,r=>r.value),live('korea-pc-games-share').rows.map(r=>`${r.share}%`));
 assert.equal(by['ufc-rankings-by-division'].divisions.length,8);
});
test('corrections and withheld rankings are consistent',()=>{
 const by=Object.fromEntries(pages.map(p=>[p.slug,p]));
 assert.deepEqual(Array.from(by['world-gdp-ranking'].rows,r=>r.name),['미국','중국','독일','일본','영국','인도','프랑스','이탈리아','러시아','브라질']);
 assert.deepEqual(Array.from(by['korea-province-population'].rows,r=>r.name),JSON.parse(fs.readFileSync('data/rankings/live/korea-province-population.json','utf8')).rows.map(r=>r.name));
 assert.equal(by['ufc-rankings-by-division'].divisions[7].contenders[2],'세르게이 파블로비치');
 assert.equal(by['highest-paid-athletes'].rows[1].name,'카넬로 알바레스');
 assert.ok(!by['file-sharing-services'].unranked&&!by['file-sharing-services'].noindex&&by['file-sharing-services'].rows.length===10);
 assert.equal(pages.filter(p=>p.noindex).length,4);
 for(const p of pages.filter(p=>p.noindex))assert.ok(p.unranked);
});
test('public lists reach ten or declare a real source limitation',()=>{
 const {rankingCountExceptions}=load('app/rankings/completion.ts');
 for(const p of pages.filter(p=>!p.noindex)){
  assert.ok(p.rows.length<=10,p.slug);
  if(p.rows.length<10)assert.ok(rankingCountExceptions[p.slug],p.slug);
  assert.equal(new Set(p.rows.map(r=>r.name+" · "+r.note)).size,p.rows.length,p.slug);
 }
 assert.equal(pages.filter(p=>!p.noindex&&p.rows.length===10).length,31);
});
test('shared row criteria move up while item-specific details remain',()=>{
 const {rankingPresentation}=load('app/rankings/presentation.ts');
 const p={date:'2026년 7월',basis:'주민등록인구',rows:[{note:'2026년 7월 · 첫 번째 설명'},{note:'2026년 7월 · 두 번째 설명'}]};
 const result=rankingPresentation(p);
 assert.equal(result.basis,'2026년 7월 · 주민등록인구');
 assert.deepEqual(Array.from(result.notes),['첫 번째 설명','두 번째 설명']);
});
test('local row images have a recorded aspect ratio for poster frames',()=>{
 const shapes=JSON.parse(fs.readFileSync('data/image-shapes.json','utf8'));
 for(const p of pages)for(const r of p.rows){const src=r.image||map[r.name];if(src?.startsWith('/ranking-images/'))assert.ok(shapes[src],`node scripts/image-shapes.mjs 실행 필요: ${src}`);}
});
test('row images come from a recorded source, never self-made placeholders',()=>{
 const assets=JSON.parse(fs.readFileSync('public/ranking-images/complete/sources.json','utf8'));
 for(const [name,a] of Object.entries(assets))assert.ok(a.source,`${name}: 출처 없는 이미지`);
});
test('every public ranking declares how it stays fresh',()=>{
 const {FRESHNESS}=load('app/rankings/freshness.ts');
 for(const p of pages.filter(p=>!p.noindex))assert.ok(FRESHNESS[p.slug],`${p.slug}: freshness.ts에 갱신 방식 없음`);
});
