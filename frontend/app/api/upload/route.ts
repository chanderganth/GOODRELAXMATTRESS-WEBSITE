import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No files provided' },
        { status: 400 }
      );
    }

    const urls: string[] = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: `File ${file.name} exceeds 5MB limit` },
          { status: 400 }
        );
      }

      const allowed = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowed.includes(file.type)) {
        return NextResponse.json(
          { success: false, message: `File ${file.name} has unsupported type` },
          { status: 400 }
        );
      }

      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const blob = await put(filename, file, {
        access: 'public',
        addRandomSuffix: false,
      });

      urls.push(blob.url);
    }

    return NextResponse.json({ success: true, data: urls });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Upload failed' },
      { status: 500 }
    );
  }
}
