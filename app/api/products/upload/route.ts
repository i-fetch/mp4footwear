import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

/**
 * Image upload handler
 * - If VERCEL_BLOB_UPLOAD_URL and VERCEL_BLOB_TOKEN are set, attempt to upload each file
 *   to that endpoint (expects a compatible upload URL that returns a JSON { url }).
 * - Otherwise, fall back to writing files into `public/products` (dev/local).
 *
 * Environment variables (set in Vercel or .env):
 * - VERCEL_BLOB_UPLOAD_URL : base upload URL to POST files to (provider-specific)
 * - VERCEL_BLOB_TOKEN : Bearer token for the upload endpoint
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

    const blobUploadUrl = process.env.VERCEL_BLOB_UPLOAD_URL || 'https://blob.vercel-storage.com';
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    const blobStoreId = process.env.BLOB_STORE_ID;
    const blobEnabled = Boolean(blobUploadUrl && blobToken && blobStoreId);

    // Helper to save locally (dev fallback)
    const saveLocally = async (file: File, fileName: string) => {
      const uploadDir = path.join(process.cwd(), 'public', 'products');
      await mkdir(uploadDir, { recursive: true });
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(path.join(uploadDir, fileName), buffer);
      return `/products/${fileName}`;
    };

    // Helper to upload to Vercel Blob storage
    const uploadToBlob = async (file: File, fileName: string) => {
      if (!blobEnabled) {
        throw new Error('Blob upload not configured');
      }

      const uploadUrl = `${blobUploadUrl}/${encodeURIComponent(blobStoreId)}/${encodeURIComponent(fileName)}`;

      const res = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${blobToken}`,
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: await file.arrayBuffer(),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Blob upload failed: ${res.status} ${text}`);
      }

      return uploadUrl;
    };

    const extension = path.extname(mainImage.name) || '.jpg';
    const mainImageName = `main-${Date.now()}${extension}`;

    let mainImageUrl: string;
    try {
      mainImageUrl = blobUploadUrl && blobToken
        ? await uploadToBlob(mainImage, mainImageName)
        : await saveLocally(mainImage, mainImageName);
    } catch (err) {
      console.error('Blob upload failed, falling back to local save:', err);
      mainImageUrl = await saveLocally(mainImage, mainImageName);
    }

    const additionalImageUrls = await Promise.all(
      additionalImages.map(async (file, index) => {
        const ext = path.extname(file.name) || '.jpg';
        const fileName = `extra-${Date.now()}-${index + 1}${ext}`;
        try {
          return blobUploadUrl && blobToken
            ? await uploadToBlob(file, fileName)
            : await saveLocally(file, fileName);
        } catch (err) {
          console.error('Additional blob upload failed, saving locally:', err);
          return saveLocally(file, fileName);
        }
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
