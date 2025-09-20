import { useSession } from "@/lib/hooks/use_session";
import { AppContextProps, AppProvider } from "./base";
import { useRouter } from "next/router";
import { LogoLoadingOverlay } from "@localspace/ui/components";

export const AppContext = (props: AppContextProps) => {
  const router = useRouter();

  const sessionQ = useSession();

  if (sessionQ.isLoading) {
    return <LogoLoadingOverlay />;
  }

  if (sessionQ.isError || !sessionQ.isSuccess) {
    router.push("/signin");
    return;
  }

  const session = sessionQ.data;

  return (
    <>
      <AppProvider
        value={{
          sessionQ,
          session,
        }}
      >
        {props.children}
      </AppProvider>
    </>
  );
};
