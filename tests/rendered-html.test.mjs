import assert from "node:assert/strict";
import test from "node:test";
import fs from 'node:fs';

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
  assert.match(html,/kbo-single-season-home-runs/);
  assert.match(html,/netflix-korea-films-weekly/);
  assert.match(html,/christopher-nolan-korea-box-office/);
  assert.match(html,/spider-man-worldwide-box-office/);
});

test('all ranking routes render audit notices, correct images and indexing rules',async()=>{
 const {default:worker}=await import(new URL('../dist/server/index.js',import.meta.url));
 const source=fs.readFileSync('app/rankings/data.ts','utf8')+fs.readFileSync('app/rankings/additions.ts','utf8')+fs.readFileSync('app/rankings/expansion.ts','utf8');
 const slugs=[...new Set([...source.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map(m=>m[1]))];
 assert.equal(slugs.length,31);
 const pending=['mlb-korean-career-earnings','korean-football-salary','korean-travel-destinations','japan-av-actress-ranking'];
 const env={ASSETS:{fetch:async()=>new Response('Not found',{status:404})}};
 const ctx={waitUntil(){},passThroughOnException(){}};
 for(const slug of slugs){const response=await worker.fetch(new Request(`http://localhost/rankings/${slug}`,{headers:{accept:'text/html'}}),env,ctx);assert.equal(response.status,200,slug);const html=(await response.text()).replace(/<!--.*?-->/g,'');assert.match(html,/2026.09.17 자료 점검/,slug);assert.doesNotMatch(html,/class="image-placeholder"/,slug);for(const m of html.matchAll(/<img[^>]+src="([^"]+)"/g))if(m[1].startsWith('/'))assert.ok(fs.existsSync(`public${m[1]}`),`${slug}: ${m[1]}`);if(pending.includes(slug)){assert.match(html,/noindex/,slug);assert.doesNotMatch(html,/"@type":"ItemList"/,slug);}for(const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g))assert.doesNotThrow(()=>JSON.parse(m[1]),slug);}
 const sitemap=await(await worker.fetch(new Request('http://localhost/sitemap.xml'),env,ctx)).text();for(const slug of pending)assert.ok(!sitemap.includes(slug));
});
