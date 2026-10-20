/** @type {import('next').NextConfig} */
const isTauriBuild = process.env.TAURI_BUILD === '1';
const isHostingBuild = process.env.HOSTING_BUILD === '1';
const isProduction = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    externalDir: true,
  },
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    unoptimized: true,
  },
  outputFileTracing: false,
};

// Firebase Hosting serves a static client bundle, so replace the server key with a harmless marker.
// The marker keeps accidental direct OpenRouter calls unauthorized and cannot reveal the real key.
if (isHostingBuild) {
  nextConfig.env = {
    ...nextConfig.env,
    NEXT_PUBLIC_OPENROUTER_API_KEY: 'hosting-preview-disabled',
    EXPO_PUBLIC_OPENROUTER_API_KEY: 'hosting-preview-disabled',
  };
}

if ((isTauriBuild && isProduction) || isHostingBuild) {
  if (isTauriBuild && isProduction) {
    nextConfig.distDir = '.next-tauri';
  }
  nextConfig.output = 'export';
}

module.exports = nextConfig;
