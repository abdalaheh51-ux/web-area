import crypto from 'crypto';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

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
      return NextResponse.json({ success: false, error: 'File is too large. Max 5MB allowed' }, { status: 413 });
    }

    if (fileType && !ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json({ success: false, error: 'Only image files are allowed' }, { status: 400 });
    }

    let bytes;
    try {
      bytes = await (file as any).arrayBuffer();
    } catch {
      return NextResponse.json({ success: false, error: 'Failed to read uploaded file' }, { status: 500 });
    }

    const buffer = Buffer.from(bytes);

    // Convert to JPEG using sharp
    let jpgBuffer: Buffer;
    try {
      jpgBuffer = await sharp(buffer)
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();
    } catch (sharpErr) {
      console.error('sharp conversion failed', sharpErr);
      return NextResponse.json({ success: false, error: 'Failed to convert image to JPEG' }, { status: 500 });
    }

    const safeName = `${type}-${Date.now()}-${crypto.randomUUID()}.jpg`;

    // ── Supabase Storage ──────────────────────────────────────────────────────
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'uploads';

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error } = await supabase.storage
        .from(bucket)
        .upload(safeName, jpgBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.error('Supabase Storage upload error', error);
        return NextResponse.json({ success: false, error: 'Supabase Storage upload failed', details: error.message }, { status: 500 });
      }

      const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(safeName);

      return NextResponse.json({ success: true, url: publicData.publicUrl, name: safeName });
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
        const blob = new Blob([jpgBuffer], { type: 'image/jpeg' });
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
          return NextResponse.json({ success: false, error: 'Cloudinary upload failed', details: json }, { status: 500 });
        }
        return NextResponse.json({ success: true, url: json.secure_url || json.url, name: json.public_id });
      } catch (err) {
        return NextResponse.json({ success: false, error: 'Cloudinary upload failed', details: err instanceof Error ? err.message : String(err) }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: false,
      error: 'No storage configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your environment variables.',
    }, { status: 500 });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload image' }, { status: 500 });
  }
}
