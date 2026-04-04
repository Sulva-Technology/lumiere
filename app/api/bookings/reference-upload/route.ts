import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getOptionalEnv } from '@/lib/env';
import { getErrorMessage } from '@/lib/validation';
import { createMediaAsset } from '@/lib/data/media';
import { checkRateLimit } from '@/lib/rate-limit';
import { assertTrustedOrigin, getClientIp } from '@/lib/security';
import { logEvent } from '@/lib/observability';

const BOOKING_REFERENCE_BUCKET = getOptionalEnv('SUPABASE_BOOKING_REFERENCE_BUCKET', 'booking-reference-images');
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

async function ensureBucket() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.storage.getBucket(BOOKING_REFERENCE_BUCKET);
  if (data) return supabase;

  await supabase.storage.createBucket(BOOKING_REFERENCE_BUCKET, {
    public: true,
    fileSizeLimit: MAX_FILE_SIZE,
    allowedMimeTypes: ALLOWED_TYPES,
  });

  return supabase;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit(`booking-reference-upload:${ip}`, 10, 60_000);
    if (!rateLimit.allowed) {
      logEvent('warn', 'booking_reference_upload.rate_limited', { ip });
      return NextResponse.json({ error: 'Upload limit reached. Please wait a moment and try again.' }, { status: 429 });
    }
    assertTrustedOrigin(request);

    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      throw new Error('Choose an image from your device before uploading.');
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Upload a JPG, PNG, WEBP, or GIF image.');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Image size must be 5MB or less.');
    }

    const supabase = await ensureBucket();
    const extension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : 'jpg';
    const safeExtension = extension && /^[a-z0-9]+$/.test(extension) ? extension : 'jpg';
    const filePath = `bookings/${Date.now()}-${crypto.randomUUID()}.${safeExtension}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage.from(BOOKING_REFERENCE_BUCKET).upload(filePath, fileBuffer, {
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from(BOOKING_REFERENCE_BUCKET).getPublicUrl(filePath);
    const mediaAsset = await createMediaAsset({
      bucket: BOOKING_REFERENCE_BUCKET,
      objectPath: filePath,
      publicUrl: publicUrlData.publicUrl,
      alt: file.name,
      ownerType: 'general',
    });

    return NextResponse.json({ data: { url: publicUrlData.publicUrl, path: filePath, bucket: BOOKING_REFERENCE_BUCKET, mediaAsset }, error: null, meta: null });
  } catch (error) {
    logEvent('warn', 'booking_reference_upload.failed', { reason: getErrorMessage(error, 'Unable to upload image.') });
    return NextResponse.json({ data: null, error: getErrorMessage(error, 'Unable to upload image.'), meta: null }, { status: 400 });
  }
}
