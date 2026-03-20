import { NextResponse } from 'next/server';
import { getCategories, getProducts } from '@/lib/data/public';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') ?? undefined;
    const [products, categories] = await Promise.all([getProducts(category), getCategories()]);
    return NextResponse.json({ products, categories });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load products.' }, { status: 500 });
  }
}
