import sharp from 'sharp';

const lightSrc = 'public/assets/brand/favicon-light.png';
const darkSrc = 'public/assets/brand/favicon-dark.png';

async function roundFavicon(size, src, output) {
  const radius = size / 2;
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${radius}" cy="${radius}" r="${radius}" fill="white"/></svg>`,
  );

  await sharp(src)
    .resize(size, size, { fit: 'cover', position: 'center' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toFile(output);

  console.log('wrote', output);
}

await roundFavicon(32, darkSrc, 'public/favicon.png');
await roundFavicon(48, darkSrc, 'public/favicon-48.png');
await roundFavicon(32, lightSrc, 'public/favicon-light.png');
await roundFavicon(180, darkSrc, 'public/apple-touch-icon.png');
await roundFavicon(180, lightSrc, 'public/apple-touch-icon-light.png');

console.log('done');
