import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

const publicDir = path.resolve(process.cwd(), 'public')
const supportedExtensions = ['.png', '.jpg', '.jpeg']
const webpQuality = 75
const avifQuality = 50

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...await walk(fullPath))
      continue
    }

    const ext = path.extname(entry.name).toLowerCase()
    if (supportedExtensions.includes(ext)) {
      files.push(fullPath)
    }
  }

  return files
}

async function convert() {
  const files = await walk(publicDir)
  if (!files.length) {
    console.log('No supported image files found in public/.')
    return
  }

  for (const filePath of files) {
    const relative = path.relative(publicDir, filePath)
    const basePath = filePath.replace(/\.(png|jpe?g)$/i, '')

    try {
      const image = sharp(filePath)
      const metadata = await image.metadata()

      if (metadata.pages && metadata.pages > 1) {
        console.log(`Skipping animated image: ${relative}`)
        continue
      }

      const webpPath = `${basePath}.webp`
      const avifPath = `${basePath}.avif`

      await image
        .resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: webpQuality, alphaQuality: 90, effort: 4 })
        .toFile(webpPath)

      await image
        .resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
        .avif({ quality: avifQuality, effort: 4 })
        .toFile(avifPath)

      console.log(`Converted: ${relative} → ${path.relative(publicDir, webpPath)}, ${path.relative(publicDir, avifPath)}`)
    } catch (error) {
      console.error(`Failed to convert ${relative}:`, error)
    }
  }
}

convert().catch((error) => {
  console.error('Conversion failed:', error)
  process.exit(1)
})
