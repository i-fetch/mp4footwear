import { connectDB } from '@/lib/mongodb';
import { Product } from '@/lib/models';
import { getAuthCookie, verifyToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const token = await getAuthCookie();
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    await connectDB();

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    const products = records.map((record: any) => ({
      name: record.name,
      brand: record.brand,
      price: parseFloat(record.price),
      originalPrice: record.originalPrice ? parseFloat(record.originalPrice) : undefined,
      rating: parseFloat(record.rating) || 4.5,
      reviews: parseInt(record.reviews) || 0,
      category: record.category,
      image: record.image,
      images: record.images ? record.images.split(';').map((s: string) => s.trim()) : [record.image],
      description: record.description,
      specs: {
        material: record.specs_material,
        weight: record.specs_weight,
        comfort: record.specs_comfort,
      },
      sizes: record.sizes
        ? record.sizes
            .split(/[,;]+/)
            .map((s: string) => parseInt(s.trim(), 10))
            .filter((n: number) => !Number.isNaN(n))
        : [6, 7, 8, 9, 10, 11, 12, 13],
      inStock: record.inStock !== 'false',
    }));

    const createdProducts = await Product.insertMany(products);

    return NextResponse.json(
      {
        message: `${createdProducts.length} products imported successfully`,
        count: createdProducts.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('CSV upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload CSV' },
      { status: 500 }
    );
  }
}
