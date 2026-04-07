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

export async function GET() {
  const products = await getProducts();
  return NextResponse.json({ success: true, data: products });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const products = await getProducts();

    const now = new Date().toISOString();
    const newProduct: Product = {
      ...body,
      id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: now,
      updatedAt: now,
    };

    products.push(newProduct);
    await saveProducts(products);

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create product' },
      { status: 500 }
    );
  }
}
