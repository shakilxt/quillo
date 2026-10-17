import { ImageResponse } from "next/og";
import { loadLogoMark } from "@/lib/og-assets";

// The home-screen icon for iOS, which needs a PNG. iOS rounds the corners itself, so the mark
// sits on a full teal square (the same teal as its own tile, so its rounded corners disappear).

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Read once at module scope, so the icon is rendered at build time (Cache Components).
const logoMark = await loadLogoMark();

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", backgroundColor: "#0b6e69" }}>
      <img src={logoMark} width={180} height={180} alt="" />
    </div>,
    size,
  );
}
