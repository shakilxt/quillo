type SiteEnv = Readonly<Record<string, string | undefined>>;

/**
 * The site's public address, for the canonical link, Open Graph, the sitemap and robots.txt.
 *
 * Vercel sets `VERCEL_PROJECT_PRODUCTION_URL` (a bare host, e.g. `quillo-demo.vercel.app`) on
 * every build, so the live site needs no setup. `SITE_URL` overrides it, for a custom domain.
 * Local builds fall back to localhost.
 */
export function siteUrl(env: SiteEnv = process.env): URL {
  if (env.SITE_URL) return new URL(env.SITE_URL);
  if (env.VERCEL_PROJECT_PRODUCTION_URL)
    return new URL(`https://${env.VERCEL_PROJECT_PRODUCTION_URL}`);
  return new URL("http://localhost:3000");
}
