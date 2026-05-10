import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
