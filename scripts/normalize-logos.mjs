#!/usr/bin/env node
// 로고 이미지 정리: 파일 안의 흰 여백·투명 여백을 잘라 내 로고가 틀 가운데에 같은 크기로 보이게 합니다.
//   node scripts/normalize-logos.mjs   (여러 번 돌려도 결과가 같습니다)
// 앱 아이콘이 없는 서비스는 정사각 타일을 만듭니다(로고 + 흰 바탕 또는 브랜드 색 바탕). 타일 원본 로고는 data/logo-sources/에 있습니다.
import sharp from 'sharp';
import fs from 'node:fs';

const TRIM = [
  ...['audi', 'bmw', 'byd', 'lexus', 'mercedes', 'mini', 'porsche', 'tesla', 'toyota', 'volvo'].map((n) => `public/ranking-images/expansion/${n}.webp`),
  ...['Doosan', 'Hanwha', 'KIA', 'KT', 'Kiwoom', 'LG', 'Lotte', 'NC', 'SSG', 'Samsung'].map((n) => `public/ranking-images/expansion/kbo_${n}.webp`),
];
/** 흰색에 가깝거나 투명한 픽셀을 뺀 실제 로고 영역 */
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
  if (!box || (box.width === size.width && box.height === size.height)) continue; // 이미 잘린 파일은 다시 저장하지 않습니다.
  const out = await sharp(input).extract(box).flatten({ background: '#ffffff' }).webp({ quality: 92 }).toBuffer();
  fs.writeFileSync(file, out);
  const m = await sharp(out).metadata();
  console.log('trim', file, `${m.width}x${m.height}`);
}

/** 투명하지 않은 픽셀 영역(흰 로고도 포함) */
async function contentBoxAny(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let [x0, y0, x1, y1] = [info.width, info.height, -1, -1];
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * 4;
    if (data[i + 3] > 10) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  }
  return x1 < 0 ? null : { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}

/** 로고를 정사각 타일 가운데에 놓습니다. size 안에서 로고가 차지하는 너비 비율은 fill입니다. */
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
// 메이플스토리는 공식 사이트 대표 이미지가 계절 이벤트 그림이라, 같은 사이트의 단풍잎 아이콘을 씁니다.
await sharp(fs.readFileSync('data/logo-sources/maplestory-icon.png')).png().toFile('public/ranking-images/games/pc-icon-maplestory.png');

/** 가로형 키 아트를 가운데 기준 정사각으로 잘라 프레임을 꽉 채웁니다. */
async function cover(src, dest, size = 512) {
  await sharp(fs.readFileSync(src)).resize(size, size, { fit: 'cover', position: 'centre' }).webp({ quality: 86 }).toFile(dest);
  console.log('cover', dest);
}
await cover('data/logo-sources/league-of-legends-key.jpg', 'public/ranking-images/games/pc-key-league-of-legends.webp');
await cover('data/logo-sources/valorant-key.jpg', 'public/ranking-images/games/pc-key-valorant.webp');
