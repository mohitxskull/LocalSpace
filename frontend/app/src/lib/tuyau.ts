import { api } from "@localspace/backend-core/api";
import { createTuyau } from "@tuyau/client";
import { createTuyauContext } from "@tuyau/react-query";

export const client = createTuyau({
  api,
  baseUrl: "http://localhost:3333",
});

export const { TuyauProvider, useTuyau, useTuyauClient } =
  createTuyauContext<typeof api>();
