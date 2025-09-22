import type { NextConfig } from "next";

import "./src/config/env/server";
import "./src/config/env/client";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  transpilePackages: ["@localspace/backend-core"],
  basePath: "/app",
  assetPrefix: "/app-static",
};

export default nextConfig;
