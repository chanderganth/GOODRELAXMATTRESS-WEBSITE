import { NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';
import type { Product } from '@/lib/types';

const PRODUCTS_BLOB = 'data/products.json';

async function getProducts(): Promise<Product[]> {
  try {
    const { blobs } = await list({ prefix: PRODUCTS_BLOB });
    if (blobs.length === 0) return [];
    const res = await fetch(blobs[0].url);
    if (!res.ok) return [];
    return (await res.json()) as Product[];
  } catch {
    return [];
  }
}

async function saveProducts(products: Product[]): Promise<void> {
  await put(PRODUCTS_BLOB, JSON.stringify(products), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  });
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const products = await getProducts();
  const product = products.find(p => p.id === params.id);
  if (!product) {
    return NextResponse.json(
      { success: false, message: 'Product not found' },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: product });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const products = await getProducts();
    const idx = products.findIndex(p => p.id === params.id);

    if (idx === -1) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const updated: Product = {
      ...products[idx],
      ...body,
      id: params.id,
      createdAt: products[idx].createdAt,
      updatedAt: new Date().toISOString(),
    };

    products[idx] = updated;
    await saveProducts(products);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const products = await getProducts();
    const filtered = products.filter(p => p.id !== params.id);

    if (filtered.length === products.length) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    await saveProducts(filtered);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
