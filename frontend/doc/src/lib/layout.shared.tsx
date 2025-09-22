import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { Github } from "lucide-react";

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <>LocalSpace</>,
    },
    // see https://fumadocs.dev/docs/ui/navigation/links
    links: [
      {
        text: "GitHub",
        url: "https://github.com/mohitxskull/LocalSpace", // Please replace with your actual GitHub URL
        icon: <Github />,
        active: "url",
      },
    ],
  };
}
