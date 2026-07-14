import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import path from 'path'
import fs from 'fs'
import sharp from 'sharp'
import { chromium } from 'playwright'

export const maxDuration = 120 // allow up to 2 minutes for screenshot capture

export async function POST(request: NextRequest) {
  let browser;
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

    browser = await chromium.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      colorScheme: colorMode as 'light' | 'dark',
      deviceScaleFactor: 1,
    });

    const page = await context.newPage();
    
    // Set preferred color scheme via JS as well to be sure
    await page.emulateMedia({ colorScheme: colorMode as 'light' | 'dark' });

    // Navigate to URL
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    
    // Wait a bit for animations/dynamic content
    await page.waitForTimeout(2000);

    // Force color scheme via CSS injection if needed
    await page.addStyleTag({
      content: `
        :root { color-scheme: ${colorMode} !important; }
        ${colorMode === 'dark' ? 'body { background-color: #000 !important; color: #fff !important; }' : ''}
      `
    });

    // Scroll through the page to trigger lazy loading
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve(null);
          }
        }, 100);
      });
    });

    // Wait for stability after scroll
    await page.waitForTimeout(1000);

    // Take full page screenshot
    const fullPageBuffer = await page.screenshot({ fullPage: true });
    
    const meta = await sharp(fullPageBuffer).metadata();
    const fullW = meta.width || 1280;
    const fullH = meta.height || 800;
    const targetW = 1000;
    
    // Slice into 4 sections for gallery
    const sectionH = Math.floor(fullH / 4);
    
    const slice = async (topOffset: number) => {
      const sliceBuffer = await sharp(fullPageBuffer)
        .extract({
          left: 0,
          top: Math.max(0, Math.min(topOffset, fullH - sectionH)),
          width: fullW,
          height: sectionH,
        })
        .resize({ width: 800, withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();
      return `data:image/jpeg;base64,${sliceBuffer.toString('base64')}`;
    };

    // Main image is the FULL tall screenshot for the scroll animation
    const mainBuffer = await sharp(fullPageBuffer)
      .resize({ width: targetW, withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();
    const mainBase64 = `data:image/jpeg;base64,${mainBuffer.toString('base64')}`;

    const g1Base64 = await slice(0);
    const g2Base64 = await slice(Math.floor(fullH * 0.33));
    const g3Base64 = await slice(Math.floor(fullH * 0.66));
    // We only need 3 gallery slots in the current schema, but user asked for 4. 
    // The 4th one will be the main one or we can add it to the response.
    const g4Base64 = await slice(fullH - sectionH);

    await browser.close();

    return NextResponse.json({
      success: true,
      imageUrl: mainBase64, // FULL TALL IMAGE
      gallery1: g1Base64,
      gallery2: g2Base64,
      gallery3: g3Base64,
      gallery4: g4Base64, // Optional if schema supports it later
    });

  } catch (error) {
    if (browser) await browser.close();
    const message = error instanceof Error ? error.message : 'unknown error'
    console.error('Screenshot error:', error);
    return NextResponse.json(
      { error: 'Screenshot capture failed: ' + message },
      { status: 500 }
    )
  }
}
