import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** The site is one page; everything else is an anchor on it. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteUrl().href, changeFrequency: "monthly", priority: 1 }];
}
