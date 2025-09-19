import { Geist, Geist_Mono } from "next/font/google";

const GeistSans = Geist({ subsets: ["latin"] });

const GeistMono = Geist_Mono({ subsets: ["latin"] });

export const FONTS = {
  GEIST: GeistSans.style.fontFamily,
  GEIST_MONO: GeistMono.style.fontFamily,
};
