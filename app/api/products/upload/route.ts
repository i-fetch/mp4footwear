import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const mainImage = formData.get('mainImage') as File | null;
    const additionalImages = formData.getAll('additionalImages') as File[];

    if (!mainImage) {
      return NextResponse.json(
        { error: 'Primary image is required' },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), 'public', 'products');
    await mkdir(uploadDir, { recursive: true });

    const saveFile = async (file: File, fileName: string) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(path.join(uploadDir, fileName), buffer);
      return `/products/${fileName}`;
    };

    const extension = path.extname(mainImage.name) || '.jpg';
    const mainImageName = `main-${Date.now()}${extension}`;
    const mainImageUrl = await saveFile(mainImage, mainImageName);

    const additionalImageUrls = await Promise.all(
      additionalImages.map(async (file, index) => {
        const ext = path.extname(file.name) || '.jpg';
        const fileName = `extra-${Date.now()}-${index + 1}${ext}`;
        return saveFile(file, fileName);
      })
    );

    return NextResponse.json({
      mainImage: mainImageUrl,
      images: [mainImageUrl, ...additionalImageUrls],
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}
