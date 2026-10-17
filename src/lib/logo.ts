/**
 * The Quillo mark: a fountain-pen nib (quill = writing invoices), with a breather hole and a slit.
 * One path, drawn with `fill-rule="evenodd"` so the hole and slit are cut out and show whatever
 * sits behind. The single source for LogoMark, the share image and the iPhone icon; icon.svg
 * repeats it (a static file can't import), and tests/logo.test.ts keeps the two in step.
 */

export const NIB_VIEWBOX = "2 0.5 20 33";

export const NIB_PATH = [
  // The cap, above the collar gap.
  "M8.5 1H15.5Q17 1 17 2.5V7.4H7V2.5Q7 1 8.5 1Z",
  // The body, tapering from the shoulders to the point.
  "M7 9H17L20 12C21.5 13.5 21.8 15.9 20.8 17.7L12 33L3.2 17.7C2.2 15.9 2.5 13.5 4 12Z",
  // The breather hole, then the slit running down from it.
  "M14.2 15.2A2.2 2.2 0 1 0 9.8 15.2A2.2 2.2 0 1 0 14.2 15.2Z",
  "M11.3 17.4H12.7V30.4H11.3Z",
].join(" ");

/** The nib alone as a data URI, for the generated images (which take <img>, not inline SVG). */
export function nibDataUri(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${NIB_VIEWBOX}"><path fill="${color}" fill-rule="evenodd" d="${NIB_PATH}"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
