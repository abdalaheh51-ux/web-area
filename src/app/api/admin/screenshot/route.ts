import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import sharp from 'sharp'
import { chromium } from 'playwright-core'

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
    
    const colorMode = mode === 'dark' ? 'dark' : 'light'
    const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN;

    if (!BROWSERLESS_TOKEN) {
      return NextResponse.json({ 
        error: 'Cloud browser token (BROWSERLESS_TOKEN) is missing in environment variables.' 
      }, { status: 500 });
    }

    // Connect to Browserless.io (Cloud Browser) - This works perfectly on Vercel
    browser = await chromium.connectOverCDP(
      `wss://chrome.browserless.io?token=${BROWSERLESS_TOKEN}`
    );
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      colorScheme: colorMode as 'light' | 'dark',
      deviceScaleFactor: 1,
    });

    const page = await context.newPage();
    
    // Set preferred color scheme
    await page.emulateMedia({ colorScheme: colorMode as 'light' | 'dark' });

    // Navigate to URL
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    
    // Wait for animations
    await page.waitForTimeout(2000);

    // Force color scheme via CSS
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

    await page.waitForTimeout(1000);

    // Take full page screenshot
    const fullPageBuffer = await page.screenshot({ fullPage: true });
    
    const meta = await sharp(fullPageBuffer).metadata();
    const fullW = meta.width || 1280;
    const fullH = meta.height || 800;
    const targetW = 1000;
    
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

    // Main image is the FULL tall screenshot
    const mainBuffer = await sharp(fullPageBuffer)
      .resize({ width: targetW, withoutEnlargement: true })
      .jpeg({ quality: 80, progressive: true })
      .toBuffer();
    const mainBase64 = `data:image/jpeg;base64,${mainBuffer.toString('base64')}`;

    const g1Base64 = await slice(0);
    const g2Base64 = await slice(Math.floor(fullH * 0.33));
    const g3Base64 = await slice(Math.floor(fullH * 0.66));

    await browser.close();

    return NextResponse.json({
      success: true,
      imageUrl: mainBase64,
      gallery1: g1Base64,
      gallery2: g2Base64,
      gallery3: g3Base64,
    });

  } catch (error) {
    if (browser) await browser.close();
    const message = error instanceof Error ? error.message : 'unknown error'
    console.error('Screenshot error:', error);
    return NextResponse.json(
      { error: 'Cloud screenshot capture failed: ' + message },
      { status: 500 }
    )
  }
}
