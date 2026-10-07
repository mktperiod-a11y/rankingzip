import assert from "node:assert/strict";
import test from "node:test";
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
const cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));const scope={exports:{},require:(name)=>load(path.resolve(path.dirname(file),name)+(name.endsWith('.json')?'':'.ts'))};cache.set(file,scope.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,scope);return scope.exports;}

const {pages}=load('app/rankings/data.ts');

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders the public ranking site without starter preview metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html=await response.text();
  assert.doesNotMatch(html, developmentPreviewMeta);
  assert.match(html,/순위ZIP/);
  const cards=html.match(/<article class="rank-card"[\s\S]*?<\/article>/g) ?? [];
  assert.ok(cards.length>20);
  for(const card of cards){assert.match(card,/개 항목을 한눈에 비교해 보세요/);assert.doesNotMatch(card,/<b>1위<\/b>/);}
  const ticker=html.match(/<section class="ticker">[\s\S]*?<\/section>/)?.[0];
  assert.ok(ticker);assert.match(ticker,/순위 보기/);assert.doesNotMatch(ticker,/ 1위 /);
  assert.match(html,/kbo-single-season-home-runs/);
  assert.match(html,/netflix-korea-films-weekly/);
  assert.match(html,/christopher-nolan-korea-box-office/);
  assert.match(html,/spider-man-worldwide-box-office/);
});

test('all ranking routes render audit notices, correct images and indexing rules',async()=>{
 const {default:worker}=await import(new URL('../dist/server/index.js',import.meta.url));
 const slugs=pages.map(p=>p.slug);
 const pending=pages.filter(p=>p.noindex).map(p=>p.slug);
 const env={ASSETS:{fetch:async()=>new Response('Not found',{status:404})}};
 const ctx={waitUntil(){},passThroughOnException(){}};
 for(const slug of slugs){const response=await worker.fetch(new Request(`http://localhost/rankings/${slug}/`,{headers:{accept:'text/html'}}),env,ctx);assert.equal(response.status,200,slug);const html=(await response.text()).replace(/<!--.*?-->/g,'');assert.ok(html.includes(pages.find(p=>p.slug===slug).auditDate),slug);assert.doesNotMatch(html,/class="image-placeholder"/,slug);for(const m of html.matchAll(/<img[^>]+src="([^"]+)"/g))if(m[1].startsWith('/'))assert.ok(fs.existsSync(`public${m[1]}`),`${slug}: ${m[1]}`);if(pending.includes(slug)){assert.match(html,/noindex/,slug);assert.doesNotMatch(html,/"@type":"ItemList"/,slug);}for(const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g))assert.doesNotThrow(()=>JSON.parse(m[1]),slug);}
 const sitemap=await(await worker.fetch(new Request('http://localhost/sitemap.xml'),env,ctx)).text();for(const slug of pending)assert.ok(!sitemap.includes(slug));
});
