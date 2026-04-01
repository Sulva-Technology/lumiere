import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { createAdminProduct, getAdminCategories, getAdminProducts } from '@/lib/data/admin';
import { adminProductCreateSchema } from '@/lib/schemas';

export async function GET() {
  try {
    await requireAdminApiUser();
    const [products, categories] = await Promise.all([getAdminProducts(), getAdminCategories()]);
    return NextResponse.json({ products, categories });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to load products.' }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminApiUser();
    const body = adminProductCreateSchema.parse(await request.json());
    const product = await createAdminProduct({
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      categoryId: body.categoryId || null,
      featured: body.featured,
      active: body.active,
      defaultImageUrl: body.defaultImageUrl || null,
      variantTitle: body.variantTitle,
      sku: body.sku,
      price: body.price,
      compareAtPrice: body.compareAtPrice ?? null,
      stockQuantity: body.stockQuantity,
      shade: body.shade || null,
      length: body.length || null,
      size: body.size || null,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create product.' }, { status: 400 });
  }
}
