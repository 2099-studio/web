import sharp from 'sharp';

const src = 'public/assets/brand/footer-wordmark-light.png';
const out = 'public/assets/brand/footer-wordmark.png';

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];

  if (r < 40 && g < 40 && b < 40) {
    data[i + 3] = 0;
  }
}

await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png()
  .toFile(out);

console.log('wrote', out);
