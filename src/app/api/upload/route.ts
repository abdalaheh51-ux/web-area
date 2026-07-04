import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
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

    const ext = path.extname(fileName) || path.extname((file as any).name || '') || '.png';
    const safeName = `${type}-${Date.now()}-${crypto.randomUUID()}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');

    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, safeName);
    await writeFile(filePath, buffer);

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
