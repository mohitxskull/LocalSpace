import { api } from "@localspace/backend-core/api";
import { createTuyau } from "@tuyau/client";
import { createTuyauContext } from "@tuyau/react-query";
import { cookieManager } from "./cookie_manager";
import { clientEnv } from "@/config/env/client";

export const client = createTuyau({
  api,
  baseUrl: clientEnv.NEXT_PUBLIC_BACKEND_URL,
  hooks: {
    beforeRequest: [
      (request) => {
        const token = cookieManager.getCookie("token");

        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }

        const captcha = cookieManager.getCookie("captcha");

        if (captcha) {
          request.headers.set("captcha", captcha);
        }
      },
    ],
  },
});

export const { TuyauProvider, useTuyau, useTuyauClient } =
  createTuyauContext<typeof api>();
