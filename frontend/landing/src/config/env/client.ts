import { createEnv } from "@t3-oss/env-nextjs";
// import * as z from "zod";

export const clientEnv = createEnv({
  client: {},
  runtimeEnv: {},
  isServer: typeof window === "undefined",
  emptyStringAsUndefined: false,
});
