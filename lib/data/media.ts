import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import type { MediaAsset } from '@/lib/types';

function mapMediaAsset(row: any): MediaAsset {
  return {
    id: row.id,
    bucket: row.bucket,
    objectPath: row.object_path,
    publicUrl: row.public_url,
    alt: row.alt,
    ownerType: row.owner_type,
    ownerId: row.owner_id,
    lifecycleStatus: row.lifecycle_status,
    sortOrder: row.sort_order,
  };
}

export async function createMediaAsset(input: {
  bucket: string;
  objectPath: string;
  publicUrl: string;
  alt?: string | null;
  ownerType?: 'product' | 'product_image' | 'variant' | 'general';
  ownerId?: string | null;
  sortOrder?: number;
}) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('media_assets')
    .insert({
      bucket: input.bucket,
      object_path: input.objectPath,
      public_url: input.publicUrl,
      alt: input.alt ?? null,
      owner_type: input.ownerType ?? 'general',
      owner_id: input.ownerId ?? null,
      sort_order: input.sortOrder ?? 0,
      lifecycle_status: 'active',
    })
    .select('*')
    .single();

  if (error) throw error;
  return mapMediaAsset(data);
}

export async function assignMediaAsset(assetId: string, ownerType: MediaAsset['ownerType'], ownerId: string, alt?: string | null) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('media_assets')
    .update({
      owner_type: ownerType,
      owner_id: ownerId,
      alt: alt ?? null,
      lifecycle_status: 'active',
    })
    .eq('id', assetId)
    .select('*')
    .single();

  if (error) throw error;
  return mapMediaAsset(data);
}

export async function updateMediaLifecycle(assetId: string, lifecycleStatus: MediaAsset['lifecycleStatus']) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('media_assets')
    .update({ lifecycle_status: lifecycleStatus })
    .eq('id', assetId)
    .select('*')
    .single();

  if (error) throw error;
  return mapMediaAsset(data);
}

export async function deleteMediaObject(assetId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('media_assets').select('*').eq('id', assetId).maybeSingle();

  if (error) throw error;
  if (!data) return null;

  if (data.object_path) {
    await supabase.storage.from(data.bucket).remove([data.object_path]);
  }

  const { data: updated, error: updateError } = await supabase
    .from('media_assets')
    .update({ lifecycle_status: 'deleted' })
    .eq('id', assetId)
    .select('*')
    .single();

  if (updateError) throw updateError;
  return mapMediaAsset(updated);
}
