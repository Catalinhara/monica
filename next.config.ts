import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Playwright and some tools hit the app via 127.0.0.1 instead of localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  experimental: {
    proxyClientMaxBodySize: "100mb",
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },
};

export default nextConfig;
