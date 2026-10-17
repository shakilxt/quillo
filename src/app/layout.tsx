import type { Metadata, Viewport } from "next";
import { brand, meta } from "@/data/product";
import { siteUrl } from "@/lib/site";
import { display, sans } from "./fonts";
import "./globals.css";

// The share image comes from opengraph-image.tsx and the icons from icon.svg and apple-icon.tsx;
// Next adds their tags. The Twitter card takes its title, description and image from Open Graph.
export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: meta.title,
  description: meta.description,
  applicationName: brand.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: brand.name,
    title: meta.title,
    description: meta.description,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  // paper, so the browser chrome on phones matches the page.
  themeColor: "#faf8f4",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
