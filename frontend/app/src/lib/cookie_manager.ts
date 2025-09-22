import { CookieManager } from "@localspace/ui/lib";

export const cookieManager = new CookieManager({
  cookieKeys: {
    captcha: "captcha",
    token: "token",
  },
});
