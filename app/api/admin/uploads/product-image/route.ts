import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApiUser } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getOptionalEnv } from '@/lib/env';
import { getErrorMessage } from '@/lib/validation';

const PRODUCT_IMAGE_BUCKET = getOptionalEnv('SUPABASE_PRODUCT_IMAGES_BUCKET', 'product-images');
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

async function ensureBucket() {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.storage.getBucket(PRODUCT_IMAGE_BUCKET);

  if (data) return supabase;

  await supabase.storage.createBucket(PRODUCT_IMAGE_BUCKET, {
    public: true,
    fileSizeLimit: MAX_FILE_SIZE,
    allowedMimeTypes: ALLOWED_TYPES,
  });

  return supabase;
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminApiUser();

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
    const filePath = `products/${Date.now()}-${crypto.randomUUID()}.${safeExtension}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabase.storage.from(PRODUCT_IMAGE_BUCKET).upload(filePath, fileBuffer, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(filePath);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      path: filePath,
      bucket: PRODUCT_IMAGE_BUCKET,
    });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error, 'Unable to upload image.') }, { status: 400 });
  }
}
