import { blogPosts } from '../../src/data/blogPosts';
import { caseStudies } from '../../src/data/caseStudies';

type HandlerEvent = any;
type HandlerContext = any;

type Handler = (
  event: HandlerEvent,
  context: HandlerContext
) => Promise<{
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}>;

const BASE_URL = 'https://webtimize.ca';

function generateUrlEntry(url: string, lastmod: string, changefreq: string, priority: string, hreflangs: { lang: string; href: string }[]) {
  const hreflangLinks = hreflangs.map(
    (link) => `    <xhtml:link rel="alternate" hreflang="${link.lang}" href="${link.href}" />`
  ).join('\n');

  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${hreflangLinks}
  </url>`;
}

const handler: Handler = async (_event: HandlerEvent, _context: HandlerContext) => {
  const today = new Date().toISOString().split('T')[0];

  // Homepage - canonical URL without query parameters
  const homepageEntry = generateUrlEntry(
    `${BASE_URL}/`,
    today,
    'weekly',
    '1.0',
    [
      { lang: 'en', href: `${BASE_URL}/` },
      { lang: 'fr', href: `${BASE_URL}/` },
      { lang: 'x-default', href: `${BASE_URL}/` },
    ]
  );

  // Blog index - canonical URL without query parameters
  const blogIndexEntry = generateUrlEntry(
    `${BASE_URL}/blog`,
    today,
    'weekly',
    '0.8',
    [
      { lang: 'en', href: `${BASE_URL}/blog` },
      { lang: 'fr', href: `${BASE_URL}/blog` },
      { lang: 'x-default', href: `${BASE_URL}/blog` },
    ]
  );

  // Blog posts - canonical URLs without query parameters
  const blogPostEntries = blogPosts.map(post => {
    const lastmod = post.publishedDate || today;
    const canonicalUrl = `${BASE_URL}/blog/${post.id}`;
    return generateUrlEntry(
      canonicalUrl,
      lastmod,
      'monthly',
      '0.7',
      [
        { lang: 'en', href: canonicalUrl },
        { lang: 'fr', href: canonicalUrl },
        { lang: 'x-default', href: canonicalUrl },
      ]
    );
  }).join('\n');

  // Case studies index - canonical URL without query parameters
  const caseStudiesIndexEntry = generateUrlEntry(
    `${BASE_URL}/case-studies`,
    today,
    'monthly',
    '0.8',
    [
      { lang: 'en', href: `${BASE_URL}/case-studies` },
      { lang: 'fr', href: `${BASE_URL}/case-studies` },
      { lang: 'x-default', href: `${BASE_URL}/case-studies` },
    ]
  );

  // Case studies posts - canonical URLs without query parameters
  const caseStudyEntries = caseStudies.map(study => {
    const lastmod = '2024-12-01';
    const canonicalUrl = `${BASE_URL}/case-studies/${study.id}`;
    return generateUrlEntry(
      canonicalUrl,
      lastmod,
      'monthly',
      '0.7',
      [
        { lang: 'en', href: canonicalUrl },
        { lang: 'fr', href: canonicalUrl },
        { lang: 'x-default', href: canonicalUrl },
      ]
    );
  }).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${homepageEntry}
${blogIndexEntry}
${blogPostEntries}
${caseStudiesIndexEntry}
${caseStudyEntries}
</urlset>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
    body: sitemap,
  };
};

export { handler };