import { connectDB } from '@/lib/mongodb';
import { Product } from '@/lib/models';
import { NextRequest, NextResponse } from 'next/server';

// GET product by ID
export async function GET(req: NextRequest, { params }: any) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const product = await Product.findById(resolvedParams.id).lean();

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Fetch product error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// UPDATE product
export async function PUT(req: NextRequest, { params }: any) {
  try {
    await connectDB();
    const data = await req.json();

    const resolvedParams = await params;

    const product = await Product.findByIdAndUpdate(resolvedParams.id, data, {
      new: true,
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(req: NextRequest, { params }: any) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const product = await Product.findByIdAndDelete(resolvedParams.id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
