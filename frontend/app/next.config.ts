import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  transpilePackages: ["@localspace/backend-core"],
  typedRoutes: true, // Now stable!
};

export default nextConfig;
