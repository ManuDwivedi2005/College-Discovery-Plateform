import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@college/shared"],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4001/:path*',
      },
    ];
  },
};

export default nextConfig;
