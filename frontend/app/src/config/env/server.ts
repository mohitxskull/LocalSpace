import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const serverEnv = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production"]).default("production"),
  },

  experimental__runtimeEnv: process.env,
  isServer: typeof window === "undefined",
  emptyStringAsUndefined: false,
});
