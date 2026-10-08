import fs from 'node:fs';
import { chromium } from 'playwright';
fs.mkdirSync('data/probe', { recursive: true });
const url = 'https://namu.wiki/w/%ED%95%9C%EA%B5%AD%20%EB%93%9C%EB%9D%BC%EB%A7%88/%EA%B0%81%EC%A2%85%20%EA%B8%B0%EB%A1%9D%E3%86%8D%EC%88%9C%EC%9C%84';
const b = await chromium.launch({ headless: true });
const p = await b.newPage({ locale: 'ko-KR', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36' });
await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
for (let i = 0; i < 12; i++) { await p.waitForTimeout(5000); if (!/Just a moment/i.test(await p.title())) break; }
fs.writeFileSync('data/probe/title.txt', await p.title());
fs.writeFileSync('data/probe/text.txt', await p.evaluate(() => document.body.innerText));
await b.close();
