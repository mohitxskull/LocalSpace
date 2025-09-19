import { useQuery } from "@tanstack/react-query";
import { useTuyau } from "../tuyau";

export const useSession = () => {
  const tuyau = useTuyau();

  return useQuery(tuyau.api.v1.customer.auth.profile.$get.queryOptions());
};
