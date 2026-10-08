import fs from 'node:fs';
const UA = 'rankingzip/1.0 (https://mktperiod-a11y.github.io/rankingzip/)';
const files = { 'one-wtc': 'One World Trade Center and Lower Manhattan skyline from the harbor, New York.jpg', 'burj-khalifa': 'The Dubai Fountain & Burj Khalifa Pixabay.jpg', 'pink-floyd': 'Pink Floyd 1967 with Syd Barrett (higher quality).jpg' };
for (const [key, file] of Object.entries(files)) {
  const r = await fetch(`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=900`, { headers: { 'user-agent': UA } });
  if (!r.ok) throw new Error(`${key} ${r.status}`);
  fs.writeFileSync(`public/ranking-images/updates/${key}.jpg`, Buffer.from(await r.arrayBuffer()));
  await new Promise((s) => setTimeout(s, 1500));
}
