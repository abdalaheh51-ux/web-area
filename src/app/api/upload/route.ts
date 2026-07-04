import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import sharp from 'sharp';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type')?.toString() || 'gallery';
    // Accept File or other blob-like objects returned by NextRequest.formData().
    if (!file || typeof (file as any).arrayBuffer !== 'function') {
      console.error('Upload error: invalid file object', { file });
      return NextResponse.json({ success: false, error: 'No file provided or invalid form-data' }, { status: 400 });
    }

    // Try to read file properties in a tolerant way
    const fileType = (file as any).type || ''
    const fileName = (file as any).name || ''
    const fileSize = (typeof (file as any).size === 'number') ? (file as any).size : undefined

    if (fileSize !== undefined && fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: 'File is too large. Max 5MB allowed' }, { status: 413 });
    }

    if (fileType && !ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json({ success: false, error: 'Only image files are allowed', details: { type: fileType } }, { status: 400 });
    }

    let bytes
    try {
      bytes = await (file as any).arrayBuffer()
    } catch (err) {
      console.error('Upload error: failed to read file arrayBuffer', err, { fileName, fileType })
      return NextResponse.json({ success: false, error: 'Failed to read uploaded file' }, { status: 500 })
    }

    const buffer = Buffer.from(bytes)

    // If Cloudinary is configured, upload there. Support unsigned (upload_preset)
    // or signed (api_key + api_secret). Otherwise save to local public/uploads.
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    const isVercel = process.env.VERCEL === '1'

    console.log('Upload API env', {
      cloudName: !!cloudName,
      uploadPreset: !!uploadPreset,
      apiKey: !!apiKey,
      apiSecret: !!apiSecret,
      isVercel,
    })

    if (cloudName && (uploadPreset || (apiKey && apiSecret))) {
      try {
        const cloudUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`

        const fd = new FormData()
        // Create a Blob from the buffer so FormData can send it
        const blob = new Blob([buffer], { type: fileType || 'application/octet-stream' })
        fd.append('file', blob, fileName || `${type}-${Date.now()}.png`)

        if (uploadPreset) {
          fd.append('upload_preset', uploadPreset)
        } else {
          // Signed upload: add timestamp, api_key and signature
          const timestamp = Math.floor(Date.now() / 1000)
          const toSign = `timestamp=${timestamp}`
          const signature = crypto.createHash('sha1').update(toSign + apiSecret).digest('hex')
          fd.append('api_key', apiKey as string)
          fd.append('timestamp', String(timestamp))
          fd.append('signature', signature)
        }

        const resp = await fetch(cloudUrl, { method: 'POST', body: fd })
        const json = await resp.json()
        if (!resp.ok) {
          console.error('Cloudinary upload failed', { status: resp.status, body: json })
          return NextResponse.json({ success: false, error: 'Cloudinary upload failed', details: json }, { status: 500 })
        }

        return NextResponse.json({ success: true, url: json.secure_url || json.url, name: json.public_id })
      } catch (err) {
        console.error('Upload error: cloudinary upload failed', err)
        return NextResponse.json({ success: false, error: 'Cloudinary upload failed', details: err instanceof Error ? err.message : String(err) }, { status: 500 })
      }
    }

    // Fallback: save to public/uploads

    // Convert to JPEG using sharp for consistent format and smaller file size
    let jpgBuffer: Buffer;
    try {
      jpgBuffer = await sharp(buffer)
        .jpeg({ quality: 85, mozjpeg: true })
        .toBuffer();
    } catch (sharpErr) {
      console.error('Upload error: sharp conversion to JPEG failed', sharpErr);
      return NextResponse.json({ success: false, error: 'Failed to convert image to JPEG' }, { status: 500 });
    }

    const safeName = `${type}-${Date.now()}-${crypto.randomUUID()}.jpg`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, safeName);
    await writeFile(filePath, jpgBuffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${safeName}`,
      name: safeName,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload image' }, { status: 500 });
  }
}
