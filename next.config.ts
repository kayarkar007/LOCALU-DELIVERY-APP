import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack root set to silence warning about local vs global lockfiles
  experimental: {
    turbo: {
      root: __dirname,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      }
    ],
  },
};

export default nextConfig;
