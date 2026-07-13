import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./app/src/i18n/request.ts');
const isDevelopment = process.env.NODE_ENV === 'development';

const r2PublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || process.env.R2_PUBLIC_URL;

const r2Hostnames = new Set<string>();

// Always allow the known production R2 public host used by product/category media.
r2Hostnames.add('pub-b8afad6fa843477fb61b00764b315e24.r2.dev');

if (r2PublicUrl) {
  try {
    r2Hostnames.add(new URL(r2PublicUrl).hostname);
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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // Soften caching for machine files; homepage remains dynamic via cookies.
        source: '/llms.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
  images: {
    // Serve sized variants via /_next/image (also HTTP/2 on the site origin).
    // Previously unoptimized:true forced full 1200px R2 assets into ~105px cards.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [64, 96, 128, 192, 256, 384],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      ...[...r2Hostnames].map((hostname) => ({
        protocol: 'https' as const,
        hostname,
        pathname: '/**' as const,
      })),
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
  },
};

export default withNextIntl(nextConfig);
