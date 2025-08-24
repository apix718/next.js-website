const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const nextConfig = {
  reactStrictMode: true,
  
  // Ensure trailing slashes are handled consistently
  trailingSlash: false,
  
  // Webpack configuration
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(process.cwd(), 'src');
    return config;
  },

  // Enable remote image domains for Next/Image optimization
  images: {
    domains: ['images.pexels.com', 'kzdtsdomkshirzcbrhxg.supabase.co']
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_VOICEFLOW_PROJECT_ID: process.env.NEXT_PUBLIC_VOICEFLOW_PROJECT_ID
  },

  // Headers for SEO
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;