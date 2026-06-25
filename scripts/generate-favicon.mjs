import sharp from 'sharp';

const lightSrc = 'public/assets/brand/favicon-light.png';
const darkSrc = 'public/assets/brand/favicon-dark.png';

async function rectFavicon(size, src, output) {
  await sharp(src)
    .resize(size, size, { fit: 'cover', position: 'center' })
    .png()
    .toFile(output);

  console.log('wrote', output);
}

await rectFavicon(32, darkSrc, 'public/favicon.png');
await rectFavicon(48, darkSrc, 'public/favicon-48.png');
await rectFavicon(32, lightSrc, 'public/favicon-light.png');
await rectFavicon(180, darkSrc, 'public/apple-touch-icon.png');
await rectFavicon(180, lightSrc, 'public/apple-touch-icon-light.png');

console.log('done');
