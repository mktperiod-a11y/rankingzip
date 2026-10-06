import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const assets=JSON.parse(fs.readFileSync('public/ranking-images/updates/sources.json','utf8'));
const compiled=ts.transpileModule(fs.readFileSync('app/rankings/additions.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
const scope={exports:{},require:()=>assets};
vm.runInNewContext(compiled,scope);
const pages=scope.exports.extraPages;
test('four complete new ranking datasets and local media',()=>{
 assert.equal(pages.length,4);
 assert.deepEqual(Array.from(pages,p=>p.rows.length),[20,8,11,10]);
 assert.equal(new Set(pages.map(p=>p.slug)).size,4);
 for(const p of pages){
  assert.ok(p.date&&p.sourceUrl&&p.basis&&p.faq.length>=2);
  assert.equal(new Set(p.rows.map(r=>r.name)).size,p.rows.length);
  for(const row of p.rows)if(row.image)assert.ok(fs.statSync(`public${row.image}`).size>0);
  if(p.posterLayout)assert.ok(p.rows.every(r=>r.image));
 }
});
test('home-run ties and order are correct',()=>{
 const rows=pages[0].rows;
 const values=Array.from(rows,r=>Number.parseInt(r.value));
 assert.deepEqual(values,[...values].sort((a,b)=>b-a));
 for(let i=0;i<rows.length;i++)assert.equal(rows[i].rank,values.indexOf(values[i])+1);
 assert.equal(rows[0].value,'56홈런');assert.equal(rows[19].value,'42홈런');
});
test('webhard comparison is third, appears only once in homepage cards',()=>{
 const home=fs.readFileSync('app/page.tsx','utf8').split('const rankings = [')[1].split('];')[0];
 const titles=Array.from(home.matchAll(/title: "([^"]+)"/g),m=>m[1]);
 assert.equal(titles[2],'파일 공유 서비스 비교');
 assert.equal(titles.filter(t=>t==='파일 공유 서비스 비교').length,1);
 for(const p of pages)assert.ok(titles.includes(p.title));
});
