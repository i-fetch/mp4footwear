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

    const blobUploadUrl = process.env.VERCEL_BLOB_UPLOAD_URL;
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    // Helper to save locally (dev fallback)
    const saveLocally = async (file: File, fileName: string) => {
      const uploadDir = path.join(process.cwd(), 'public', 'products');
      await mkdir(uploadDir, { recursive: true });
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(path.join(uploadDir, fileName), buffer);
      return `/products/${fileName}`;
    };

    // Helper to upload to an external signed upload URL / service
    const uploadToBlob = async (file: File, fileName: string) => {
      if (!blobUploadUrl || !blobToken) {
        throw new Error('Blob upload not configured');
      }

      // Caller should provide a compatible upload endpoint. This implementation
      // POSTs the file as the request body to `${blobUploadUrl}?name=${fileName}`
      // with Authorization header. The upload endpoint must return JSON { url }.
      const uploadUrl = `${blobUploadUrl}?name=${encodeURIComponent(fileName)}`;

      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${blobToken}`,
        },
        body: await file.arrayBuffer(),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Blob upload failed: ${res.status} ${text}`);
      }

      const data = await res.json();
      if (!data || !data.url) {
        throw new Error('Blob upload response missing url');
      }

      return data.url as string;
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
