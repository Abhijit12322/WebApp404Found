import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // The magic link: Frontend calls /api/flask -> Next.js sends to Python Port 5000
        source: '/api/flask/:path*',
        destination: 'http://127.0.0.1:5000/:path*',
      },
    ];
  },
};

export default nextConfig;
