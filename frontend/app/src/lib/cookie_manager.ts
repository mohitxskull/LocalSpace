import { CookieManager } from "@localspace/ui/lib/cookie_manager";

export const cookieManager = new CookieManager({
  cookieKeys: {
    captcha: "captcha",
  },
});
