import fs from 'fs';
import path from 'path';
import { blogPosts } from '../src/data/blogPosts';

const domain = 'https://webascendio.com';
const entries = blogPosts.map(p => ({
  loc: `${domain}/blog/${p.id}`,
  lastmod: p.publishedDate,
  changefreq: 'monthly',
  priority: p.featured ? '0.9' : '0.8',
}));

const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  `  <url><loc>${domain}/</loc><lastmod>2025-08-25</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>\n` +
  `  <url><loc>${domain}/blog</loc><lastmod>2025-08-25</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n` +
  entries.map(e => `  <url><loc>${e.loc}</loc><lastmod>${e.lastmod}</lastmod><changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`).join('\n') +
  `\n</urlset>`;

// Write to public/sitemap.xml (overwrite)
fs.writeFileSync(path.resolve(__dirname, '../public/sitemap.xml'), sitemap);
console.log('Sitemap generated with', entries.length, 'posts.');