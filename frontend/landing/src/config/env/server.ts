import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const serverEnv = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production"]).default("development"),

    APP_URL: z.url().min(1).default("http://localhost:3001"),
    DOC_URL: z.url().min(1).default("http://localhost:3002"),
  },

  experimental__runtimeEnv: process.env,
  isServer: typeof window === "undefined",
  emptyStringAsUndefined: false,
});
