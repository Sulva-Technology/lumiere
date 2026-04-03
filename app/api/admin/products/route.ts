import { NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { createAdminProduct, getAdminCategories, getAdminProducts, updateAdminProduct } from '@/lib/data/admin';
import { adminProductCreateSchema, adminProductUpdateSchema } from '@/lib/schemas';
import { getErrorMessage } from '@/lib/validation';

export async function GET() {
  try {
    await requireAdminApiUser();
    const [products, categories] = await Promise.all([getAdminProducts(), getAdminCategories()]);
    return NextResponse.json({ products, categories });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error, 'Unable to load products.') }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminApiUser();
    const body = adminProductCreateSchema.parse(await request.json());
    const product = await createAdminProduct({
      name: body.name,
      slug: body.slug,
      description: body.description || null,
      categoryId: body.categoryId || null,
      featured: body.featured,
      active: body.active,
      defaultImageUrl: body.defaultImageUrl || null,
      mediaAssetId: body.mediaAssetId || null,
      variantTitle: body.variantTitle,
      sku: body.sku,
      price: body.price,
      compareAtPrice: body.compareAtPrice ?? null,
      stockQuantity: body.stockQuantity,
      shade: body.shade || null,
      length: body.length || null,
      size: body.size || null,
      actorUserId: admin.id,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error, 'Unable to create product.') }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdminApiUser();
    const body = adminProductUpdateSchema.parse(await request.json());

    if (!body.id) {
      return NextResponse.json({ error: 'Product id is required.' }, { status: 400 });
    }

    const product = await updateAdminProduct(body.id, {
      name: body.name,
      slug: body.slug,
      description: body.description,
      categoryId: body.categoryId,
      featured: body.featured,
      active: body.active,
      lifecycleStatus: body.lifecycleStatus,
      defaultImageUrl: body.defaultImageUrl || null,
      mediaAssetId: body.mediaAssetId || null,
      actorUserId: admin.id,
    });

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error, 'Unable to update product.') }, { status: 400 });
  }
}
