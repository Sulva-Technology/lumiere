import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdminApiUser } from '@/lib/auth';
import { adminGalleryItemSchema } from '@/lib/schemas';
import { createGalleryItem, deleteGalleryItem, getAdminGallery, updateGalleryItem } from '@/lib/data/gallery';
import { getErrorMessage } from '@/lib/validation';

export async function GET() {
  try {
    await requireAdminApiUser();
    return NextResponse.json({ items: await getAdminGallery() });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error, 'Unable to load gallery.') }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminApiUser('manager');
    const body = adminGalleryItemSchema.parse(await request.json());
    const item = await createGalleryItem({
      title: body.title ?? null,
      alt: body.alt,
      category: body.category ?? null,
      imageUrl: body.imageUrl,
      mediaAssetId: body.mediaAssetId ?? null,
      sortOrder: body.sortOrder,
      active: body.active,
    });
    revalidatePath('/');
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error, 'Unable to add gallery image.') }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdminApiUser('manager');
    const body = adminGalleryItemSchema.parse(await request.json());
    if (!body.id) throw new Error('Gallery image is required.');
    const item = await updateGalleryItem(body.id, {
      title: body.title ?? null,
      alt: body.alt,
      category: body.category ?? null,
      imageUrl: body.imageUrl,
      mediaAssetId: body.mediaAssetId ?? null,
      sortOrder: body.sortOrder,
      active: body.active,
    });
    revalidatePath('/');
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error, 'Unable to update gallery image.') }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminApiUser('manager');
    const id = request.nextUrl.searchParams.get('id');
    if (!id) throw new Error('Gallery image is required.');
    await deleteGalleryItem(id);
    revalidatePath('/');
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error, 'Unable to remove gallery image.') }, { status: 400 });
  }
}
