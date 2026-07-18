import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 ثانية للعملية

/**
 * API لالتقاط صورة (Screenshot) من موقع ويب
 * 
 * Body:
 * - url: رابط الموقع المراد التقاط صورة منه
 * - theme: 'dark' أو 'light' (الوضع المظلم أو المضيء)
 * - delay: التأخير بالميلي ثانية قبل التقاط الصورة (افتراضي: 40000 = 40 ثانية)
 * - fullPage: التقاط الصفحة كاملة (افتراضي: true)
 * - width: عرض الصفحة (افتراضي: 1920)
 * - height: ارتفاع الصفحة (افتراضي: 1080)
 */

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { url, theme = 'light', delay = 40000, fullPage = true, width = 1920, height = 1080 } = await request.json();

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // التحقق من صحة الرابط
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // ✅ استخدام Puppeteer لالتقاط الصورة
    let screenshotBuffer: Buffer;
    try {
      // محاولة استيراد Puppeteer
      const puppeteer = await import('puppeteer');
      const browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();

      // تعيين حجم الشاشة
      await page.setViewport({ width, height });

      // تعيين الوضع المظلم أو المضيء
      if (theme === 'dark') {
        await page.emulateMediaFeatures([
          { name: 'prefers-color-scheme', value: 'dark' },
        ]);
      } else {
        await page.emulateMediaFeatures([
          { name: 'prefers-color-scheme', value: 'light' },
        ]);
      }

      // الانتظار لتحميل الصفحة
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // الانتظار للتأخير المحدد (لضمان تحميل الصور الكسولة)
      await new Promise(resolve => setTimeout(resolve, delay));

      // التقاط الصورة
      screenshotBuffer = await page.screenshot({
        fullPage,
        type: 'jpeg',
        quality: 85,
      }) as Buffer;

      await browser.close();
    } catch (puppeteerError) {
      console.error('Puppeteer error:', puppeteerError);

      // إذا فشل Puppeteer، جرب استخدام Playwright
      try {
        const playwright = await import('playwright');
        const browser = await playwright.chromium.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const context = await browser.newContext({
          colorScheme: theme as 'light' | 'dark',
          viewport: { width, height },
        });

        const page = await context.newPage();

        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

        // الانتظار للتأخير المحدد
        await new Promise(resolve => setTimeout(resolve, delay));

        screenshotBuffer = await page.screenshot({
          fullPage,
          type: 'jpeg',
          quality: 85,
        }) as Buffer;

        await context.close();
        await browser.close();
      } catch (playwrightError) {
        console.error('Playwright error:', playwrightError);
        return NextResponse.json(
          {
            success: false,
            error: 'Screenshot service not available',
            details: 'Neither Puppeteer nor Playwright is installed',
          },
          { status: 500 }
        );
      }
    }

    // ✅ رفع الصورة إلى التخزين
    const uploadFormData = new FormData();
    const blob = new Blob([screenshotBuffer], { type: 'image/jpeg' });
    uploadFormData.append('file', blob, `screenshot-${Date.now()}.jpg`);
    uploadFormData.append('type', 'screenshot');

    const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/upload`, {
      method: 'POST',
      body: uploadFormData,
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    const uploadData = await uploadRes.json();

    if (!uploadData.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to upload screenshot',
          details: uploadData.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadData.url,
      name: uploadData.name,
      theme,
      delay,
      dimensions: { width, height },
    });
  } catch (error) {
    console.error('Screenshot error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to capture screenshot',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
