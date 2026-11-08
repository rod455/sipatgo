import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer", "postgres", "bcryptjs"],
  images: { unoptimized: true },
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
};

export default nextConfig;
