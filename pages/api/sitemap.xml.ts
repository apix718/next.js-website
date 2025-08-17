import type { NextApiRequest, NextApiResponse } from 'next';
import { blogPosts } from '@/data/blogPosts';
import { caseStudies } from '@/data/caseStudies';

const BASE_URL = 'https://webtmize.ca';

function generateUrlEntry(url: string, lastmod: string, changefreq: string, priority: string, hreflangs: { lang: string; href: string }[]) {
  const hreflangLinks = hreflangs.map(
    (link) => `<xhtml:link rel="alternate" hreflang="${link.lang}" href="${link.href}" />`
  ).join('\n    ');

  return `
  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    ${hreflangLinks}
  </url>`;
}

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/xml');

  const today = new Date().toISOString().split('T')[0];

  // Homepage
  const homepageEntry = generateUrlEntry(
    `${BASE_URL}/`,
    today,
    'weekly',
    '1.0',
    [
      { lang: 'en', href: `${BASE_URL}/` },
      { lang: 'fr', href: `${BASE_URL}/?lang=fr` },
      { lang: 'x-default', href: `${BASE_URL}/` },
    ]
  );

  // Blog index
  const blogIndexEntry = generateUrlEntry(
    `${BASE_URL}/blog`,
    today,
    'weekly',
    '0.8',
    [
      { lang: 'en', href: `${BASE_URL}/blog` },
      { lang: 'fr', href: `${BASE_URL}/blog?lang=fr` },
      { lang: 'x-default', href: `${BASE_URL}/blog` },
    ]
  );

  // Blog posts - ONLY EXISTING ONES
  const blogPostEntries = blogPosts.map(post => {
    const lastmod = post.publishedDate || today;
    return generateUrlEntry(
      `${BASE_URL}/blog/${post.id}`,
      lastmod,
      'monthly',
      '0.7',
      [
        { lang: 'en', href: `${BASE_URL}/blog/${post.id}` },
        { lang: 'fr', href: `${BASE_URL}/blog/${post.id}?lang=fr` },
        { lang: 'x-default', href: `${BASE_URL}/blog/${post.id}` },
      ]
    );
  }).join('');

  // Case studies index
  const caseStudiesIndexEntry = generateUrlEntry(
    `${BASE_URL}/case-studies`,
    today,
    'monthly',
    '0.8',
    [
      { lang: 'en', href: `${BASE_URL}/case-studies` },
      { lang: 'fr', href: `${BASE_URL}/case-studies?lang=fr` },
      { lang: 'x-default', href: `${BASE_URL}/case-studies` },
    ]
  );

  // Case studies posts
  const caseStudyEntries = caseStudies.map(study => {
    const lastmod = '2024-12-01'; // You can customize or add lastmod to your data if needed
    return generateUrlEntry(
      `${BASE_URL}/case-studies/${study.id}`,
      lastmod,
      'monthly',
      '0.7',
      [
        { lang: 'en', href: `${BASE_URL}/case-studies/${study.id}` },
        { lang: 'fr', href: `${BASE_URL}/case-studies/${study.id}?lang=fr` },
        { lang: 'x-default', href: `${BASE_URL}/case-studies/${study.id}` },
      ]
    );
  }).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset 
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
  ${homepageEntry}
  ${blogIndexEntry}
  ${blogPostEntries}
  ${caseStudiesIndexEntry}
  ${caseStudyEntries}
</urlset>`;

  res.status(200).send(sitemap);
}