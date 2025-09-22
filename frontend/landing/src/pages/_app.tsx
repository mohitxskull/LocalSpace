import "@mantine/core/styles.css";
import "@mantine/nprogress/styles.css";
import "@/styles/global.css";

import type { AppProps } from "next/app";
import { MantineProvider } from "@mantine/core";
import { NavigationProgress } from "@mantine/nprogress";
import { GoogleTagManager } from "@next/third-parties/google";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { setting } from "@localspace/ui/configs/setting";
import { theme } from "@localspace/ui/configs/theme";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

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

      <GoogleTagManager gtmId={setting.gtmId} />

      <MantineProvider theme={theme}>
        <NavigationProgress />

        <Component {...pageProps} />
      </MantineProvider>
    </>
  );
}
