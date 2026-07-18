import crypto from 'crypto';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// ✅ FIX #3: تحسين معالجة الصور
const MIN_IMAGE_WIDTH = 400;
const MIN_IMAGE_HEIGHT = 300;
const MAX_IMAGE_WIDTH = 1920;
const MAX_IMAGE_HEIGHT = 1080;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type')?.toString() || 'gallery';

    if (!file || typeof (file as any).arrayBuffer !== 'function') {
      return NextResponse.json(
        { success: false, error: 'No file provided or invalid form-data' },
        { status: 400 }
      );
    }

    const fileType = (file as any).type || '';
    const fileSize = (typeof (file as any).size === 'number') ? (file as any).size : undefined;

    // ✅ FIX #7: معالجة أفضل للأخطاء - تمييز بين أنواع الأخطاء
    if (fileSize !== undefined && fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: 'File is too large',
          details: `Maximum file size is 5MB, but you uploaded ${(fileSize / 1024 / 1024).toFixed(2)}MB`,
        },
        { status: 413 } // Payload Too Large
      );
    }

    if (fileType && !ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file type',
          details: `Only JPEG, PNG, WebP, and GIF are allowed. You uploaded ${fileType}`,
        },
        { status: 400 } // Bad Request
      );
    }

    let bytes;
    try {
      bytes = await (file as any).arrayBuffer();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Failed to read uploaded file' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(bytes);

    // ✅ FIX #3: تحسين معالجة الصور - التحقق من الأبعاد وتحسين الجودة
    let jpgBuffer: Buffer;
    let imageMetadata;

    try {
      // الحصول على معلومات الصورة الأصلية
      const metadata = await sharp(buffer).metadata();
      imageMetadata = metadata;

      // ✅ FIX #5: التحقق من أبعاد الصورة الدنيا
      if (
        !metadata.width ||
        !metadata.height ||
        metadata.width < MIN_IMAGE_WIDTH ||
        metadata.height < MIN_IMAGE_HEIGHT
      ) {
        return NextResponse.json(
          {
            success: false,
            error: 'Image dimensions too small',
            details: `Minimum dimensions are ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT}px, but your image is ${metadata.width}x${metadata.height}px`,
          },
          { status: 400 }
        );
      }

      // معالجة الصورة: تحسين الحجم والجودة
      let pipeline = sharp(buffer);

      // إذا كانت الصورة PNG بشفافية، احفظها كـ PNG
      const isPNG = fileType === 'image/png' && metadata.hasAlpha;

      if (isPNG) {
        // الحفاظ على الشفافية في PNG
        jpgBuffer = await pipeline
          .resize(MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .png({ quality: 85, progressive: true })
          .toBuffer();
      } else {
        // تحويل إلى JPEG عالي الجودة
        jpgBuffer = await pipeline
          .resize(MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .jpeg({
            quality: 85,
            mozjpeg: true,
            progressive: true,
          })
          .toBuffer();
      }
    } catch (sharpErr) {
      console.error('sharp conversion failed', sharpErr);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to process image',
          details: sharpErr instanceof Error ? sharpErr.message : 'Unknown error',
        },
        { status: 400 }
      );
    }

    const fileExtension = isPNG ? 'png' : 'jpg';
    const safeName = `${type}-${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;

    // ── Supabase Storage ──────────────────────────────────────────────────────
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase.storage
        .from(bucket)
        .upload(safeName, jpgBuffer, {
          contentType: isPNG ? 'image/png' : 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.error('Supabase Storage upload error', error);
        return NextResponse.json(
          {
            success: false,
            error: 'Storage upload failed',
            details: error.message,
          },
          { status: 500 }
        );
      }

      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(safeName);

      return NextResponse.json({
        success: true,
        url: publicData.publicUrl,
        name: safeName,
        originalDimensions: imageMetadata ? `${imageMetadata.width}x${imageMetadata.height}` : 'unknown',
      });
    }

    // ── Cloudinary fallback ───────────────────────────────────────────────────
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && (uploadPreset || (apiKey && apiSecret))) {
      try {
        const cloudUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const fd = new FormData();
        const blob = new Blob([jpgBuffer], { type: isPNG ? 'image/png' : 'image/jpeg' });
        fd.append('file', blob, safeName);

        if (uploadPreset) {
          fd.append('upload_preset', uploadPreset);
        } else {
          const timestamp = Math.floor(Date.now() / 1000);
          const signature = crypto
            .createHash('sha1')
            .update(`timestamp=${timestamp}` + apiSecret)
            .digest('hex');
          fd.append('api_key', apiKey as string);
          fd.append('timestamp', String(timestamp));
          fd.append('signature', signature);
        }

        const resp = await fetch(cloudUrl, { method: 'POST', body: fd });
        const json = await resp.json();

        if (!resp.ok) {
          return NextResponse.json(
            {
              success: false,
              error: 'Cloudinary upload failed',
              details: json.error?.message || 'Unknown error',
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          url: json.secure_url || json.url,
          name: json.public_id,
          originalDimensions: imageMetadata ? `${imageMetadata.width}x${imageMetadata.height}` : 'unknown',
        });
      } catch (err) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cloudinary upload failed',
            details: err instanceof Error ? err.message : String(err),
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'No storage configured',
        details: 'Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment variables.',
      },
      { status: 500 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
