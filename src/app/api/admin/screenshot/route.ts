import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import sharp from 'sharp'

const execAsync = promisify(exec)

export const maxDuration = 120 // allow up to 2 minutes for screenshot capture

export async function POST(request: NextRequest) {
  try {
    // Auth check — only admins can capture screenshots
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { url, mode } = await request.json()
    if (!url || typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: 'A valid http(s) URL is required' }, { status: 400 })
    }
    // Validate the optional color-scheme mode (default: light)
    const colorMode = mode === 'dark' ? 'dark' : 'light'

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const timestamp = Date.now()
    const rawPng = path.join(uploadsDir, `screenshot-raw-${timestamp}.png`)
    const session = `ss-${timestamp}`
    // imageUrl = the FULL tall screenshot (used by the card + scroll animation)
    // gallery1/2/3 = three different vertical sections of the same page
    const fullJpg = path.join(uploadsDir, `screenshot-${timestamp}-main.jpg`)
    const gallery1Jpg = path.join(uploadsDir, `screenshot-${timestamp}-g1.jpg`)
    const gallery2Jpg = path.join(uploadsDir, `screenshot-${timestamp}-g2.jpg`)
    const gallery3Jpg = path.join(uploadsDir, `screenshot-${timestamp}-g3.jpg`)
    const fullPath = `/uploads/screenshot-${timestamp}-main.jpg`
    const g1Path = `/uploads/screenshot-${timestamp}-g1.jpg`
    const g2Path = `/uploads/screenshot-${timestamp}-g2.jpg`
    const g3Path = `/uploads/screenshot-${timestamp}-g3.jpg`

    const run = async (cmd: string, timeoutMs = 60000) => {
      try {
        await execAsync(cmd, { timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024 })
      } catch (e) {
        // non-fatal for some commands; caller decides
        throw e
      }
    }

    try {
      // Fetch screenshot using a free external API (Thum.io)
      const fetchUrl = `https://image.thum.io/get/width/1280/crop/4000/${url}`
      const response = await fetch(fetchUrl)
      
      if (!response.ok) {
        throw new Error('Failed to capture screenshot from external service')
      }
      
      const buffer = await response.arrayBuffer()
      fs.writeFileSync(rawPng, Buffer.from(buffer))

      // 7) Produce the final images:
      //    - imageUrl (main.jpg) = the FULL tall screenshot (resized to 800px width).
      //      The card uses this with the card-scroll-preview animation, so it
      //      must stay tall to allow top→bottom panning.
      //    - gallery1/2/3 = three different vertical sections (different parts
      //      of the site) so the modal shows varied views.
      const meta = await sharp(rawPng).metadata()
      const fullW = meta.width || 1280
      const fullH = meta.height || 8000
      const targetW = 800
      // Section height in source pixels — use ~1200px so each crop is a
      // meaningful chunk (roughly one viewport+), not too thin.
      const sectionH = Math.min(1200, Math.floor(fullH / 4))
      const slice = async (
        out: string,
        topOffset: number,
      ) => sharp(rawPng)
        .extract({
          left: 0,
          top: Math.max(0, Math.min(topOffset, fullH - sectionH)),
          width: fullW,
          height: sectionH,
        })
        .resize({ width: targetW, withoutEnlargement: true })
        .jpeg({ quality: 80, progressive: true })
        .toFile(out)

      // imageUrl = full tall screenshot (for the card + scroll animation)
      await sharp(rawPng)
        .resize({ width: targetW, withoutEnlargement: true })
        .jpeg({ quality: 80, progressive: true })
        .toFile(fullJpg)
      // Gallery 1 = ~25% down
      await slice(gallery1Jpg, Math.floor(fullH * 0.25))
      // Gallery 2 = ~55% down (middle area)
      await slice(gallery2Jpg, Math.floor(fullH * 0.55))
      // Gallery 3 = ~80% down (late section, but leave room for footer)
      await slice(gallery3Jpg, Math.floor(fullH * 0.80))

      // 8) Remove the big raw PNG
      try { fs.unlinkSync(rawPng) } catch {}

      return NextResponse.json({
        success: true,
        path: fullPath,
        imageUrl: fullPath,
        gallery1: g1Path,
        gallery2: g2Path,
        gallery3: g3Path,
      })
    } finally {
      // Cleanup raw file if it still exists after an error
      try { if (fs.existsSync(rawPng)) fs.unlinkSync(rawPng) } catch {}
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    return NextResponse.json(
      { error: 'Screenshot capture failed: ' + message },
      { status: 500 }
    )
  }
}
