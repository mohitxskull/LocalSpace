import "@mantine/core/styles.css";
import "@mantine/nprogress/styles.css";
import "@mantine/notifications/styles.css";
import "@/styles/global.css";
import "@localspace/ui/theme.css";

import type { AppProps } from "next/app";
import { MantineProvider } from "@mantine/core";
import { NavigationProgress } from "@mantine/nprogress";
import { Notifications } from "@mantine/notifications";
import { NuqsAdapter } from "nuqs/adapters/next/pages";
import { GoogleTagManager } from "@next/third-parties/google";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { setting } from "@localspace/ui/configs/setting";
import { shadcnTheme } from "@localspace/ui/configs/shadcn_theme";
import { shadcnCssVariableResolver } from "@localspace/ui/configs/shadcn_css_variable_resolver";
import { client, TuyauProvider } from "@/lib/tuyau";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: false,
      },
    },
  });
};

let browserQueryClient: QueryClient | undefined = undefined;

const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const queryClient = getQueryClient();

  return (
    <>
      <NextSeo
        title={setting.app.name}
        description={setting.app.description}
        openGraph={{
          title: setting.app.name,
          description: setting.app.description,
          url: router.asPath,
          site_name: setting.app.name,
          images: [
            {
              url: setting.bannerUrl,
            },
          ],
        }}
        additionalLinkTags={[
          {
            rel: "icon",
            href: setting.iconUrl,
          },
          {
            rel: "manifest",
            href: setting.manifestUrl,
          },
        ]}
        additionalMetaTags={[
          {
            name: "theme-color",
            content: setting.app.themeColor,
          },
        ]}
      />

      <GoogleTagManager gtmId="GTM-XYZ" />

      <QueryClientProvider client={queryClient}>
        <TuyauProvider client={client} queryClient={queryClient}>
          <MantineProvider
            theme={shadcnTheme}
            cssVariablesResolver={shadcnCssVariableResolver}
          >
            <NuqsAdapter>
              <NavigationProgress />
              <Notifications />
              <Component {...pageProps} />
            </NuqsAdapter>
          </MantineProvider>
        </TuyauProvider>
      </QueryClientProvider>
    </>
  );
}
