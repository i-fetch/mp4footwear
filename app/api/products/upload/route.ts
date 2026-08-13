import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { put } from '@vercel/blob';

/**
 * Image upload handler
 * - If BLOB_READ_WRITE_TOKEN is set, uploads to Vercel Blob using private access.
 * - Otherwise, falls back to local storage in `public/products`.
 */
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

    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    const blobEnabled = Boolean(blobToken);

    // Helper to save locally (dev fallback)
    const saveLocally = async (file: File, fileName: string) => {
      const uploadDir = path.join(process.cwd(), 'public', 'products');
      await mkdir(uploadDir, { recursive: true });
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(path.join(uploadDir, fileName), buffer);
      return `/products/${fileName}`;
    };

    // Helper to upload to Vercel Blob storage using official SDK
    const uploadToBlob = async (file: File, fileName: string) => {
      if (!blobEnabled) {
        throw new Error('Blob upload not configured');
      }

      const blob = await put(fileName, file, {
        access: 'private', // Match your store's private setting
        token: blobToken,
      });

      return blob.url;
    };

    const extension = path.extname(mainImage.name) || '.jpg';
    const mainImageName = `main-${Date.now()}${extension}`;
    const useBlob = blobEnabled;

    const mainImageUrl = useBlob
      ? await uploadToBlob(mainImage, mainImageName)
      : await saveLocally(mainImage, mainImageName);

    const additionalImageUrls = await Promise.all(
      additionalImages.map(async (file, index) => {
        const ext = path.extname(file.name) || '.jpg';
        const fileName = `extra-${Date.now()}-${index + 1}${ext}`;
        return useBlob
          ? await uploadToBlob(file, fileName)
          : await saveLocally(file, fileName);
      })
    );

    return NextResponse.json({
      mainImage: mainImageUrl,
      images: [mainImageUrl, ...additionalImageUrls],
      uploadSource: useBlob ? 'blob' : 'local',
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
}