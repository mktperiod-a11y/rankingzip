#!/usr/bin/env node
// 인물 사진을 위키미디어 공용의 자유 이용 사진(CC BY·CC BY-SA·CC0·퍼블릭 도메인·영국 OGL)으로만 가져옵니다.
//   node scripts/fetch-portraits.mjs   → public/ranking-images/portraits/*.jpg, credits.json
// 야구 선수는 구단 로고로 통일해 여기서 받지 않습니다. 선수 본인 문서의 대표 사진만 쓰고, 공용(Commons)에 없는 사진(비자유 이미지)은 쓰지 않습니다.
import fs from 'node:fs';

const OUT = 'public/ranking-images/portraits';
const UA = 'RankingZipBot/1.0 (https://mktperiod-a11y.github.io/rankingzip/)';
const FREE = /^(CC BY(-SA)? \d|CC0|Public domain|PD|CC-BY|OGL)/i;
const KIND = {
  mma: { en: /mixed martial|MMA|fighter/i, ko: /종합격투기|격투기|UFC/ },
  football: { en: /footballer|soccer/i, ko: /축구/ },
  athlete: { en: /footballer|basketball|boxer|baseball|player|athlete|golfer|racing driver/i, ko: /선수/ },
  musician: { en: /band|singer|musician|rapper|songwriter/i, ko: /밴드|가수|음악가|래퍼/ },
};

// [화면 이름, 영문 검색어, 종목, 한국어 위키 먼저]
export const PEOPLE = [
  ...[['조슈아 반','Joshua Van'],['알렉산드레 판토자','Alexandre Pantoja'],['마넬 케이프','Manel Kape'],['브랜든 로이발','Brandon Royval'],['페트르 얀','Petr Yan'],['메랍 드발리시빌리','Merab Dvalishvili'],['션 오말리',"Sean O'Malley"],['우마르 누르마고메도프','Umar Nurmagomedov'],['알렉산더 볼카노프스키','Alexander Volkanovski'],['모브사르 에블로예프','Movsar Evloev'],['디에고 로페스','Diego Lopes'],['레론 머피','Lerone Murphy'],['저스틴 게이치','Justin Gaethje'],['일리아 토푸리아','Ilia Topuria'],['아르만 사루키안','Arman Tsarukyan'],['찰스 올리베이라','Charles Oliveira'],['이슬람 마카체프','Islam Makhachev'],['이안 마차도 개리','Ian Machado Garry'],['카를로스 프라치스','Carlos Prates'],['마이클 모랄레스','Michael Morales (fighter)'],['션 스트릭랜드','Sean Strickland'],['함자트 치마예프','Khamzat Chimaev'],['드리커스 뒤 플레시','Dricus du Plessis'],['나수르딘 이마보프','Nassourdine Imavov'],['카를로스 울버그','Carlos Ulberg'],['마고메드 안칼라예프','Magomed Ankalaev'],['유리 프로하스카','Jiří Procházka'],['알렉스 페레이라','Alex Pereira'],['톰 아스피날','Tom Aspinall'],['시릴 간','Ciryl Gane'],['알렉산더 볼코프','Alexander Volkov (fighter)'],['커티스 블레이즈','Curtis Blaydes'],['세르게이 파블로비치','Sergei Pavlovich']].map(([ko,en])=>[ko,en,'mma',false]),
  ...[['크리스티아누 호날두','Cristiano Ronaldo'],['리오넬 메시','Lionel Messi'],['카넬로 알바레스','Canelo Álvarez'],['르브론 제임스','LeBron James'],['오타니 쇼헤이','Shohei Ohtani'],['스테픈 커리','Stephen Curry'],['타이슨 퓨리','Tyson Fury'],['닥 프레스콧','Dak Prescott'],['존 람','Jon Rahm'],['카림 벤제마','Karim Benzema'],['케빈 듀랜트','Kevin Durant'],['루이스 해밀턴','Lewis Hamilton']].map(([ko,en])=>[ko,en,'athlete',false]),
  ...[['비틀스','The Beatles'],['마이클 잭슨','Michael Jackson'],['엘비스 프레슬리','Elvis Presley'],['마돈나','Madonna'],['엘턴 존','Elton John'],['퀸','Queen (band)'],['레드 제플린','Led Zeppelin'],['리애나','Rihanna'],['핑크 플로이드','Pink Floyd'],['에미넴','Eminem']].map(([ko,en])=>[ko,en,'musician',false]),
];

// 운영자가 직접 고른 사진을 쓰는 인물은 받지 않습니다(app/rankings/portraits.ts의 PHOTO_OVERRIDE).
const MANUAL = new Set(['카넬로 알바레스']);

const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\([^)]*\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const strip = (html = '') => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function api(host, params) {
  const url = new URL(`https://${host}/w/api.php`);
  for (const [k, v] of Object.entries({ format: 'json', formatversion: '2', ...params })) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`${host} ${res.status}`);
  return res.json();
}

/**
 * 위키백과에서 정확한 제목의 문서만 찾습니다(검색 결과의 엉뚱한 사람을 막기 위해). 동명이인은 "(야구 선수)" 같은 제목을 함께 시도하고,
 * 문서 설명이 종목과 맞는 경우만 받아들입니다.
 */
async function leadImage(lang, titles, kind) {
  const data = await api(`${lang}.wikipedia.org`, { action: 'query', titles: titles.join('|'), redirects: '1', prop: 'pageimages|description|extracts', piprop: 'name', exintro: '1', explaintext: '1', exchars: '400' });
  const q = data.query ?? {};
  const resolve = (t) => { let x = t; for (const m of [...(q.normalized ?? []), ...(q.redirects ?? [])]) if (m.from === x) x = m.to; return x; };
  const re = KIND[kind][lang];
  for (const t of titles) {
    const page = (q.pages ?? []).find((p) => p.title === resolve(t) && !p.missing);
    if (page?.pageimage && re.test(`${page.description ?? ''} ${page.extract ?? ''}`)) return { file: page.pageimage, article: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`, title: page.title };
  }
  return null;
}

/** 공용(Commons)에 있는 자유 이용 사진만 정보와 함께 돌려줍니다. */
async function commonsInfo(file) {
  const data = await api('commons.wikimedia.org', { action: 'query', titles: `File:${file}`, prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '480' });
  const info = data.query?.pages?.[0]?.imageinfo?.[0];
  if (!info) return null;
  const m = info.extmetadata ?? {};
  const license = strip(m.LicenseShortName?.value);
  if (!FREE.test(license)) return { rejected: license || '라이선스 없음' };
  return { thumb: info.thumburl || info.url, page: info.descriptionurl, license, licenseUrl: m.LicenseUrl?.value, author: strip(m.Artist?.value) || '작자 미상' };
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const credits = {};
  for (const [name, en, kind, koFirst] of PEOPLE) {
    await new Promise((r) => setTimeout(r, 1500)); // 위키미디어 요청 제한을 넘지 않게 천천히 받습니다.
    if (MANUAL.has(name)) continue;
    let found = null, reason = '';
    const base = en.replace(/\s*\([^)]*\)$/, '');
    const enTitles = [en, `${base} (fighter)`, `${base} (baseball)`, `${base} (baseball player)`, base];
    const koTitles = [`${name} (야구 선수)`, `${name} (격투기 선수)`, name];
    for (const [lang, titles] of koFirst ? [['ko', koTitles], ['en', enTitles]] : [['en', enTitles], ['ko', koTitles]]) {
      try {
        const lead = await leadImage(lang, titles, kind);
        if (!lead) { reason = `${lang}: 문서·사진 없음`; continue; }
        const info = await commonsInfo(lead.file);
        if (!info) { reason = `${lang}: 공용에 없는 사진(비자유)`; continue; }
        if (info.rejected) { reason = `${lang}: 비자유 라이선스(${info.rejected})`; continue; }
        found = { ...info, article: lead.article, title: lead.title };
        break;
      } catch (error) { reason = `${lang}: ${error.message}`; }
    }
    if (!found) { console.log(`✗ ${name} — ${reason}`); continue; }
    const file = `${OUT}/${slug(en)}.jpg`;
    const res = await fetch(found.thumb, { headers: { 'user-agent': UA } });
    if (!res.ok) { console.log(`✗ ${name} — 사진 내려받기 ${res.status}`); continue; }
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    credits[name] = { image: `/${file.replace(/^public\//, '')}`, source: found.page, license: found.license, licenseUrl: found.licenseUrl, author: found.author, article: found.article };
    console.log(`✓ ${name} — ${found.title} · ${found.license} · ${found.author.slice(0, 40)}`);
  }
  fs.writeFileSync(`${OUT}/credits.json`, `${JSON.stringify(credits, null, 2)}\n`);
  console.log(`\n사진 ${Object.keys(credits).length}/${PEOPLE.length}명`);
}

main().catch((e) => { console.error(e); process.exit(1); });
