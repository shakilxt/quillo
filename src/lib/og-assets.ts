import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ImageResponse } from "next/og";

// Files for the generated images (opengraph-image.tsx, apple-icon.tsx). They read these at module
// scope, so both images are rendered at build time and the reads never run on a visitor's request.

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

/** The favicon (app/icon.svg) as a data URI, so every image draws the mark from one file. */
export async function loadLogoMark(): Promise<string> {
  const svg = await readFile(join(process.cwd(), "src/app/icon.svg"));
  return `data:image/svg+xml;base64,${svg.toString("base64")}`;
}
