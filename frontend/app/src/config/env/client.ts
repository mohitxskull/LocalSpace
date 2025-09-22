import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_CAPTCHA_PUBLIC_KEY: z.string().min(1),

    NEXT_PUBLIC_BACKEND_URL: z.url().min(1).default("http://localhost:3333"),
  },
  runtimeEnv: {
    NEXT_PUBLIC_CAPTCHA_PUBLIC_KEY: process.env.NEXT_PUBLIC_CAPTCHA_PUBLIC_KEY,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
  },
  isServer: typeof window === "undefined",
  emptyStringAsUndefined: false,
});
