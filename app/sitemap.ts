import { MetadataRoute } from 'next';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://thedmashop.com';
  let productUrls: MetadataRoute.Sitemap = [];

  try {
    const supabase = createSupabaseAdminClient();
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('active', true)
      .eq('lifecycle_status', 'active');

    productUrls = (products ?? []).map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: product.updated_at,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch {
    productUrls = [];
  }

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/book`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  return [...staticUrls, ...productUrls];
}
