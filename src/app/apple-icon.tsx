import { ImageResponse } from "next/og";
import { nibDataUri } from "@/lib/logo";

// The home-screen icon for iOS, which needs a PNG: the favicon's white nib on teal. iOS rounds
// the corners itself, so the tile here is a full square.

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const nib = nibDataUri("#ffffff");

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#0b6e69",
      }}
    >
      <img src={nib} width={73} height={120} alt="" />
    </div>,
    size,
  );
}
