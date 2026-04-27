import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'Googlebot-News',
        allow: '/news/',
      },
    ],
    sitemap: [
      'https://pvpwire.com/sitemap.xml',
      'https://pvpwire.com/sitemap-news.xml',
    ],
    host: 'https://pvpwire.com',
  };
}
