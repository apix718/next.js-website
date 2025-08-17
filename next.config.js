import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(process.cwd(), 'src');
    return config;
  },
  env: {
    NEXT_PUBLIC_VOICEFLOW_PROJECT_ID: process.env.NEXT_PUBLIC_VOICEFLOW_PROJECT_ID
  }
};

export default nextConfig;