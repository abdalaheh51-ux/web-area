import { NextRequest, NextResponse } from 'next/server';

/**
 * API للترجمة التلقائية من العربية إلى الإنجليزية
 * يستخدم Google Translate API
 */

export async function POST(request: NextRequest) {
  try {
    const { text, sourceLanguage = 'ar', targetLanguage = 'en' } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: 400 }
      );
    }

    // ✅ استخدام Google Translate API
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    
    if (!apiKey) {
      console.warn('GOOGLE_TRANSLATE_API_KEY not configured, using fallback translation');
      // Fallback: إذا لم يكن API Key موجود، نرجع النص كما هو
      return NextResponse.json({
        success: true,
        original: text,
        translated: text,
        note: 'Using fallback translation (API key not configured)',
      });
    }

    const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        key: apiKey,
      }),
    });

    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const translatedText = data.data.translations[0].translatedText;

    return NextResponse.json({
      success: true,
      original: text,
      translated: translatedText,
      sourceLanguage,
      targetLanguage,
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Translation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
