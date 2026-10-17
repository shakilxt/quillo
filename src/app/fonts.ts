import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";

// Self-hosted by next/font at build time; no runtime request to Google Fonts.
// Both are variable fonts, so one file covers every weight.
export const display = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

export const sans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument",
});
