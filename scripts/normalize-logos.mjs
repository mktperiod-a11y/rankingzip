#!/usr/bin/env node
import sharp from 'sharp';
import fs from 'node:fs';

const TRIM = [
  ...['audi', 'bmw', 'byd', 'lexus', 'mercedes', 'mini', 'porsche', 'tesla', 'toyota', 'volvo'].map((n) => `public/ranking-images/expansion/${n}.webp`),
];
async function contentBox(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let [x0, y0, x1, y1] = [info.width, info.height, -1, -1];
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * 4;
    if (data[i + 3] > 10 && Math.min(data[i], data[i + 1], data[i + 2]) < 235) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  }
  return x1 < 0 ? null : { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}
for (const file of TRIM) {
  const input = fs.readFileSync(file);
  const box = await contentBox(input);
  const size = await sharp(input).metadata();
  if (!box || (box.width === size.width && box.height === size.height)) continue;
  const out = await sharp(input).extract(box).flatten({ background: '#ffffff' }).webp({ quality: 92 }).toBuffer();
  fs.writeFileSync(file, out);
  const m = await sharp(out).metadata();
  console.log('trim', file, `${m.width}x${m.height}`);
}

async function contentBoxAny(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let [x0, y0, x1, y1] = [info.width, info.height, -1, -1];
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * 4;
    if (data[i + 3] > 10) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  }
  return x1 < 0 ? null : { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

async function tile(src, dest, { background, fill = 0.78, size = 512 }) {
  const raw = await sharp(fs.readFileSync(src), { density: 300 }).png().toBuffer();
  const box = (await contentBoxAny(raw)) ?? { left: 0, top: 0, ...(await sharp(raw).metadata()) };
  const logo = await sharp(raw).extract({ left: box.left, top: box.top, width: box.width, height: box.height }).png().toBuffer();
  const m = await sharp(logo).metadata();
  const scale = Math.min((size * fill) / m.width, (size * fill) / m.height);
  const resized = await sharp(logo).resize(Math.round(m.width * scale), Math.round(m.height * scale)).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background } }).composite([{ input: resized, gravity: 'center' }]).png().toFile(dest);
  console.log('tile', dest);
}
await tile('data/logo-sources/fileis.svg', 'public/ranking-images/apps/tile-fileis.png', { background: '#ffffff', fill: 0.8 });
await tile('data/logo-sources/filemong.webp', 'public/ranking-images/apps/tile-filemong.png', { background: '#b14747', fill: 0.74 });
await sharp(fs.readFileSync('data/logo-sources/maplestory-icon.png')).png().toFile('public/ranking-images/games/pc-icon-maplestory.png');

async function cover(src, dest, size = 512) {
  await sharp(fs.readFileSync(src)).resize(size, size, { fit: 'cover', position: 'centre' }).webp({ quality: 86 }).toFile(dest);
  console.log('cover', dest);
}
await cover('data/logo-sources/league-of-legends-key.jpg', 'public/ranking-images/games/pc-key-league-of-legends.webp');
await cover('data/logo-sources/valorant-key.jpg', 'public/ranking-images/games/pc-key-valorant.webp');

const kboSources = JSON.parse(fs.readFileSync('public/ranking-images/expansion/sources.json', 'utf8'));
for (const svg of fs.readdirSync('data/logo-sources/kbo').filter((f) => f.endsWith('.svg')).sort()) {
  const team = svg.replace(/\.svg$/, '');
  const dest = `public/ranking-images/expansion/kbo_${team}.webp`;
  const out = await sharp(fs.readFileSync(`data/logo-sources/kbo/${svg}`), { density: 300 }).resize(320, 320, { fit: 'inside' }).webp({ quality: 92, alphaQuality: 100 }).toBuffer();
  fs.writeFileSync(dest, out);
  const m = await sharp(out).metadata();
  kboSources[`kbo_${team}`] = { image: dest.replace(/^public/, ''), source: 'https://www.koreabaseball.com/Kbo/League/TeamInfo.aspx', original: `data/logo-sources/kbo/${svg}`, width: m.width, height: m.height, checked: '2026-10-07' };
  console.log('kbo', dest, `${m.width}x${m.height}`);
}
fs.writeFileSync('public/ranking-images/expansion/sources.json', JSON.stringify(kboSources, null, 2) + '\n');
