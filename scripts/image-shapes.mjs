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
