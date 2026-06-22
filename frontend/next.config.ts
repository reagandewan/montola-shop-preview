import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: (process.env.NEXT_PUBLIC_API_IMAGES_PROTOCOL as any) || 'http',
        hostname: process.env.NEXT_PUBLIC_API_IMAGES_HOSTNAME || 'localhost',
        port: process.env.NEXT_PUBLIC_API_IMAGES_PORT || '8080',
        pathname: '/api/**',
      },
    ],
  },
};

export default nextConfig;
