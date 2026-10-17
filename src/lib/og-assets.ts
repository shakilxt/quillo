import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ImageResponse } from "next/og";

// Fonts for the generated share image (opengraph-image.tsx). It reads them at module scope, so the
// image is rendered at build time and the reads never run on a visitor's request.

type ImageFonts = NonNullable<NonNullable<ConstructorParameters<typeof ImageResponse>[1]>["fonts"]>;

const fontDir = join(process.cwd(), "assets/fonts");

/**
 * The page's fonts as static TTFs: ImageResponse can't use next/font or variable fonts. Latin
 * subsets from Fontsource, under the SIL Open Font License (licences beside the files).
 */
export async function loadOgFonts(): Promise<ImageFonts> {
  const [bricolage, instrumentMedium, instrumentSemiBold] = await Promise.all([
    readFile(join(fontDir, "BricolageGrotesque-Bold.ttf")),
    readFile(join(fontDir, "InstrumentSans-Medium.ttf")),
    readFile(join(fontDir, "InstrumentSans-SemiBold.ttf")),
  ]);
  return [
    { name: "Bricolage Grotesque", data: bricolage, weight: 700, style: "normal" },
    { name: "Instrument Sans", data: instrumentMedium, weight: 500, style: "normal" },
    { name: "Instrument Sans", data: instrumentSemiBold, weight: 600, style: "normal" },
  ];
}
