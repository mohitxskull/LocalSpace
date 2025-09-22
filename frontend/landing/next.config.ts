import type { NextConfig } from "next";

import "./src/config/env/server";
import "./src/config/env/client";

import { serverEnv } from "./src/config/env/server";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  transpilePackages: ["@localspace/backend-core"],
  async rewrites() {
    return [
      // App Zone
      {
        source: "/app",
        destination: `${serverEnv.APP_URL}/app`,
      },
      {
        source: "/app/:path*",
        destination: `${serverEnv.APP_URL}/app/:path*`,
      },
      {
        source: "/app-static/:path*",
        destination: `${serverEnv.APP_URL}/app-static/:path*`,
      },
      // Doc Zone
      {
        source: "/doc",
        destination: `${serverEnv.DOC_URL}/doc`,
      },
      {
        source: "/doc/:path*",
        destination: `${serverEnv.DOC_URL}/doc/:path*`,
      },
      {
        source: "/doc-static/:path*",
        destination: `${serverEnv.DOC_URL}/doc-static/:path*`,
      },
    ];
  },
};

export default nextConfig;
