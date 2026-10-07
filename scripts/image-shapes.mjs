// 로컬 순위 이미지의 가로/세로 비율을 data/image-shapes.json에 저장합니다.
// 포스터 칸(2:3)에서 비율이 크게 다른 이미지만 잘리지 않게 줄여 넣을 때 씁니다.
// 이미지를 추가하거나 바꾼 뒤 실행하세요: node scripts/image-shapes.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = 'public/ranking-images';
const files = fs.readdirSync(root, { recursive: true }).map(String).filter(f => /\.(jpe?g|png|webp|gif|svg)$/i.test(f)).sort();
const shapes = {};
for (const f of files) {
  const m = await sharp(path.join(root, f)).metadata();
  if (m.width && m.height) shapes[`/ranking-images/${f.split(path.sep).join('/')}`] = Math.round((m.width / m.height) * 1000) / 1000;
}
fs.writeFileSync('data/image-shapes.json', JSON.stringify(shapes, null, 1) + '\n');
console.log(`이미지 비율 ${Object.keys(shapes).length}개 저장`);
