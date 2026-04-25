import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/book',
          '/about',
          '/contact',
          '/faq',
          '/privacy-policy',
          '/terms-of-service',
          '/sitemap.xml',
          '/llms.txt'
        ],
        disallow: ['/admin', '/api', '/checkout', '/preview', '/internal'],
      },
      {
        userAgent: ['OAI-SearchBot', 'GPTBot', 'ChatGPT-User'],
        allow: [
          '/',
          '/llms.txt',
          '/book',
          '/about',
          '/faq',
          '/contact',
          '/privacy-policy',
          '/terms-of-service'
        ],
        disallow: ['/admin', '/api', '/checkout'],
      }
    ],
    sitemap: 'https://itzlolabeauty.com/sitemap.xml',
  };
}
