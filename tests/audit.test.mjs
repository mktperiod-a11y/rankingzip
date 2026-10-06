import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import test from 'node:test';
import assert from 'node:assert/strict';
const cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));const scope={exports:{},require:(name)=>load(path.resolve(path.dirname(file),name)+(name.endsWith('.json')?'':'.ts'))};cache.set(file,scope.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,scope);return scope.exports;}
const {pages}=load('app/rankings/data.ts');
const detail=fs.readFileSync('app/rankings/[slug]/page.tsx','utf8');
const map=JSON.parse(detail.match(/export const imageByName[^=]*= (\{[\s\S]*?\n\});/)[1]);
test('all 33 pages have explicit audit decisions and no broken local row images',()=>{
 assert.equal(pages.length,33);assert.equal(new Set(pages.map(p=>p.slug)).size,33);
 for(const p of pages){assert.ok(p.auditDate,p.slug);for(const r of p.rows){const src=r.image||map[r.name];assert.ok(src,`${p.slug}: missing ${r.name}`);if(src.startsWith('/'))assert.ok(fs.statSync('public'+src).size>100,src);assert.ok(!src.includes('unsplash'),`unverified stock image ${p.slug}`);}}
});
test('new season rankings and imported brands are complete and linked',()=>{
 const by=Object.fromEntries(pages.map(p=>[p.slug,p]));
 const hr=by['kbo-home-runs-2026'],rbi=by['kbo-rbi-2026'],cars=by['korea-import-car-brands'];
 assert.deepEqual(Array.from(hr.rows,r=>r.value),['40홈런','39홈런','36홈런','32홈런','27홈런']);
 assert.deepEqual(Array.from(rbi.rows,r=>r.value),['121타점','114타점','113타점','108타점','102타점']);
 assert.equal(rbi.rows[1].name,'샘 힐리어드');assert.equal(rbi.rows[2].name,'르윈 디아즈');assert.equal(cars.rows.length,10);
 assert.equal(cars.rows[0].value,'10,400대');assert.match(cars.rows[0].note,/34.9%/);
 const {slugByTitle}=load('app/rankings/data.ts');
 const home=fs.readFileSync('app/home.tsx','utf8');
 for(const p of [hr,rbi,cars]){assert.equal(slugByTitle[p.title],p.slug);assert.ok(home.includes(p.title));assert.ok(p.faq.length>=3);for(const r of p.rows){assert.ok(r.imageSource&&r.sourceUrl);assert.ok(r.image.startsWith('/ranking-images/expansion/'));}}
});
test('current KBO standings and box office changes are reflected',()=>{
 const by=Object.fromEntries(pages.map(p=>[p.slug,p]));
 const teams=by['kbo-team-standings-2026'];assert.equal(teams.rows.length,10);assert.equal(teams.rows[0].name,'KT');assert.match(teams.rows[1].note,/2.5경기 차/);
 const films=by['korea-box-office-2026'];assert.deepEqual(Array.from(films.rows.slice(0,3),r=>r.name),['왕과 사는 남자','오디세이','스파이더맨: 브랜드 뉴 데이']);assert.equal(films.rows[1].value,'10,027,997명');
 assert.equal(by['worldwide-box-office-2026'].rows[0].value,'$2,332,507,928');
});
test('corrections and withheld rankings are consistent',()=>{
 const by=Object.fromEntries(pages.map(p=>[p.slug,p]));
 assert.deepEqual(Array.from(by['world-gdp-ranking'].rows,r=>r.name),['미국','중국','독일','일본','영국','인도']);
 assert.equal(by['korean-movie-admissions'].rows[1].name,'왕과 사는 남자');
 assert.equal(by['korea-box-office-2026'].rows[3].name,'군체');
 assert.equal(by['korea-box-office-2026'].rows[4].name,'호프');
 assert.equal(by['korea-province-population'].rows[4].name,'전남광주통합특별시');
 assert.equal(by['ufc-rankings-by-division'].divisions[7].contenders[2],'세르게이 파블로비치');
 assert.equal(by['highest-paid-athletes'].rows[1].name,'카넬로 알바레스');
 assert.ok(!by['file-sharing-services'].unranked&&!by['file-sharing-services'].noindex&&by['file-sharing-services'].source.startsWith('Google Trends'));
 assert.equal(pages.filter(p=>p.noindex).length,4);
 for(const p of pages.filter(p=>p.noindex))assert.ok(p.unranked);
});
