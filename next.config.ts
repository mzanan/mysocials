import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.redd.it',
      },
      {
        protocol: 'https',
        hostname: 'preview.redd.it',
      },
      {
        protocol: 'https',
        hostname: 'external-preview.redd.it',
      },
      {
        protocol: 'https',
        hostname: '**.thumbs.redditmedia.com',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
      },
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
      },
    ],
  },
  serverExternalPackages: ['canvas', 'jsdom'],
  turbopack: {},
  experimental: {
    optimizePackageImports: ['motion', 'lucide-react'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        canvas: 'commonjs canvas',
      })
    }

    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    }

    return config
  },
};

export default nextConfig;
