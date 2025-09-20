import { client } from "@/lib/tuyau";
import { createSafeContext } from "@mantine/core";
import { UseQueryResult } from "@tanstack/react-query";
import { InferResponseType } from "@tuyau/client";

export type AppContextProps = {
  children: React.ReactNode;
};

export type AppProviderValues = {
  sessionQ: UseQueryResult<
    InferResponseType<typeof client.api.v1.customer.auth.profile.$get>
  >;
  session: InferResponseType<typeof client.api.v1.customer.auth.profile.$get>;
};

export const [AppProvider, useAppContext] =
  createSafeContext<AppProviderValues>(
    'The component was not found in the tree under the "AppProvider"',
  );
