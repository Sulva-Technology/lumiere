import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { GalleryItem } from '@/lib/types';

function mapGalleryItem(row: any): GalleryItem {
  return {
    id: row.id,
    title: row.title,
    alt: row.alt,
    category: row.category,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
    active: row.active,
    mediaAssetId: row.media_asset_id,
  };
}

export async function getAdminGallery(): Promise<GalleryItem[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .order('sort_order')
    .order('created_at');

  if (error) throw error;
  return (data ?? []).map(mapGalleryItem);
}

export async function createGalleryItem(input: Omit<GalleryItem, 'id'>) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('gallery_items')
    .insert({
      title: input.title,
      alt: input.alt,
      category: input.category,
      image_url: input.imageUrl,
      media_asset_id: input.mediaAssetId,
      sort_order: input.sortOrder,
      active: input.active,
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapGalleryItem(data);
}

export async function updateGalleryItem(id: string, input: Omit<GalleryItem, 'id'>) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('gallery_items')
    .update({
      title: input.title,
      alt: input.alt,
      category: input.category,
      image_url: input.imageUrl,
      media_asset_id: input.mediaAssetId,
      sort_order: input.sortOrder,
      active: input.active,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return mapGalleryItem(data);
}

export async function deleteGalleryItem(id: string) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from('gallery_items').delete().eq('id', id);
  if (error) throw error;
}
