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
  
  // Environment variables
  env: {
    NEXT_PUBLIC_VOICEFLOW_PROJECT_ID: process.env.NEXT_PUBLIC_VOICEFLOW_PROJECT_ID
  },

  // Redirects for canonical URLs
  async redirects() {
    return [
      // Remove trailing slashes
      {
        source: '/blog/',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/case-studies/',
        destination: '/case-studies',
        permanent: true,
      },
      // Clean up language query parameters
      {
        source: '/blog',
        has: [
          {
            type: 'query',
            key: 'lang',
          },
        ],
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/case-studies',
        has: [
          {
            type: 'query',
            key: 'lang',
          },
        ],
        destination: '/case-studies',
        permanent: true,
      },
      {
        source: '/',
        has: [
          {
            type: 'query',
            key: 'lang',
          },
        ],
        destination: '/',
        permanent: true,
      },
    ];
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