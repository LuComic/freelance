import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 120,
    },
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "pageboard.app",
          },
        ],
        destination: "https://www.pageboard.app/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
