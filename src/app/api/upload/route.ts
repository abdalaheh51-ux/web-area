import crypto from 'crypto';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_IMAGE_WIDTH = 1920;
const MAX_IMAGE_HEIGHT = 1080;
const OUTPUT_QUALITY = 75;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type')?.toString() || 'gallery';

    if (!file || typeof (file as any).arrayBuffer !== 'function') {
      return NextResponse.json({ success: false, error: 'No file provided or invalid form-data' }, { status: 400 });
    }

    const fileType = (file as any).type || '';
    const fileSize = (typeof (file as any).size === 'number') ? (file as any).size : undefined;

    if (fileSize !== undefined && fileSize > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: 'File is too large',
          details: `Maximum file size is 5MB, but uploaded ${(fileSize / 1024 / 1024).toFixed(2)}MB`,
        },
        { status: 413 }
      );
    }

    if (fileType && !ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only image files are allowed',
          details: `Allowed types: JPEG, PNG, WebP, GIF, AVIF. Received ${fileType}`,
        },
        { status: 400 }
      );
    }

    let bytes;
    try {
      bytes = await (file as any).arrayBuffer();
    } catch {
      return NextResponse.json({ success: false, error: 'Failed to read uploaded file' }, { status: 500 });
    }

    const buffer = Buffer.from(bytes);
    let outputBuffer: Buffer;
    let metadata;

    try {
      const image = sharp(buffer, { animated: fileType === 'image/gif' });
      metadata = await image.metadata();

      if (!metadata.width || !metadata.height || metadata.width < 400 || metadata.height < 300) {
        return NextResponse.json(
          {
            success: false,
            error: 'Image dimensions too small',
            details: `Minimum dimensions are 400x300px, but image is ${metadata.width || 0}x${metadata.height || 0}px`,
          },
          { status: 400 }
        );
      }

      outputBuffer = await image
        .resize(MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({
          quality: OUTPUT_QUALITY,
          alphaQuality: 90,
          effort: 4,
          smartSubsample: true,
          nearLossless: false,
          animated: fileType === 'image/gif',
        })
        .toBuffer();
    } catch (sharpErr) {
      console.error('sharp conversion failed', sharpErr);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to process image',
          details: sharpErr instanceof Error ? sharpErr.message : 'Unknown sharp error',
        },
        { status: 500 }
      );
    }

    const safeName = `${type}-${Date.now()}-${crypto.randomUUID()}.webp`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase.storage
        .from(bucket)
        .upload(safeName, outputBuffer, {
          contentType: 'image/webp',
          upsert: true,
        });

      if (error) {
        console.error('Supabase Storage upload error', error);
        return NextResponse.json(
          {
            success: false,
            error: 'Supabase Storage upload failed',
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
        originalDimensions: metadata ? `${metadata.width}x${metadata.height}` : 'unknown',
      });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && (uploadPreset || (apiKey && apiSecret))) {
      try {
        const cloudUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const fd = new FormData();
        const blob = new Blob([outputBuffer], { type: 'image/webp' });
        fd.append('file', blob, safeName);

        if (uploadPreset) {
          fd.append('upload_preset', uploadPreset);
        } else {
          const timestamp = Math.floor(Date.now() / 1000);
          const signature = crypto.createHash('sha1').update(`timestamp=${timestamp}` + apiSecret).digest('hex');
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
              details: json,
            },
            { status: 500 }
          );
        }
        return NextResponse.json({
          success: true,
          url: json.secure_url || json.url,
          name: json.public_id,
          originalDimensions: metadata ? `${metadata.width}x${metadata.height}` : 'unknown',
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
        error: 'No storage configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment variables.',
      },
      { status: 500 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload image' }, { status: 500 });
  }
}
