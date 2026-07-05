const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const publicDir = path.join(__dirname, '../public');
const logoPath = path.join(publicDir, 'logo.png');

async function generateFavicons() {
  try {
    if (!fs.existsSync(logoPath)) {
      console.error('Logo file not found at:', logoPath);
      return;
    }

    console.log('Generating optimized favicons from:', logoPath);

    // 1. favicon-16x16.png
    await sharp(logoPath)
      .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'favicon-16x16.png'));
    console.log('Generated favicon-16x16.png');

    // 2. favicon-32x32.png
    await sharp(logoPath)
      .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));
    console.log('Generated favicon-32x32.png');

    // 3. apple-touch-icon.png (180x180)
    await sharp(logoPath)
      .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    console.log('Generated apple-touch-icon.png (180x180)');

    // 4. android-chrome-192x192.png
    await sharp(logoPath)
      .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'android-chrome-192x192.png'));
    console.log('Generated android-chrome-192x192.png');

    // 5. android-chrome-512x512.png
    await sharp(logoPath)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(publicDir, 'android-chrome-512x512.png'));
    console.log('Generated android-chrome-512x512.png');

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateFavicons();
