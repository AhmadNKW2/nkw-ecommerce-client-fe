import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./app/src/i18n/request.ts');
const isDevelopment = process.env.NODE_ENV === 'development';

const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL;

let r2Hostname = '';
if (r2PublicUrl) {
  try {
    r2Hostname = new URL(r2PublicUrl).hostname;
  } catch (error) {
    console.warn('Could not parse R2_PUBLIC_URL in next.config.ts:', error);
  }
}

const nextConfig: NextConfig = {
  ...(isDevelopment
    ? {}
    : {
      experimental: {
        optimizePackageImports: ['lucide-react', '@tanstack/react-query', 'framer-motion'],
      },
    }),
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'ordonsooq.com' }],
        destination: 'https://www.ordonsooq.com/:path*',
        statusCode: 301,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      ...(r2Hostname
        ? [
          {
            protocol: 'https' as const,
            hostname: r2Hostname,
            pathname: '/**',
          },
        ]
        : []),
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
