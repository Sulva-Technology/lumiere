import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getOptionalEnv } from '@/lib/env';
import { getErrorMessage } from '@/lib/validation';
import { createMediaAsset } from '@/lib/data/media';
import { checkRateLimit } from '@/lib/rate-limit';
import { assertTrustedOrigin, getClientIp } from '@/lib/security';

const IMAGE_BUCKET = getOptionalEnv('SUPABASE_PRODUCT_IMAGES_BUCKET', 'product-images');
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit(`admin-gallery-upload:${ip}`, 20, 60_000);
    if (!rateLimit.allowed) return NextResponse.json({ error: 'Upload limit reached. Please wait a moment and try again.' }, { status: 429 });

    await requireAdminApiUser('manager');
    assertTrustedOrigin(request);
    const file = (await request.formData()).get('file');
    if (!(file instanceof File)) throw new Error('Choose an image from your device before uploading.');
    if (!ALLOWED_TYPES.includes(file.type)) throw new Error('Upload a JPG, PNG, WEBP, or GIF image.');
    if (file.size > MAX_FILE_SIZE) throw new Error('Image size must be 5MB or less.');

    const supabase = createSupabaseAdminClient();
    const { data: bucket } = await supabase.storage.getBucket(IMAGE_BUCKET);
    if (!bucket) await supabase.storage.createBucket(IMAGE_BUCKET, { public: true, fileSizeLimit: MAX_FILE_SIZE, allowedMimeTypes: ALLOWED_TYPES });

    const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const objectPath = `gallery/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(IMAGE_BUCKET).upload(objectPath, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(objectPath);
    const mediaAsset = await createMediaAsset({ bucket: IMAGE_BUCKET, objectPath, publicUrl: urlData.publicUrl, alt: file.name, ownerType: 'general' });
    return NextResponse.json({ url: urlData.publicUrl, mediaAsset });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error, 'Unable to upload gallery image.') }, { status: 400 });
  }
}
