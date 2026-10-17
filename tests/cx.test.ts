import { describe, expect, it } from "vitest";
import { cx } from "@/lib/cx";

describe("cx", () => {
  it("joins class names with single spaces", () => {
    expect(cx("a", "b", "c")).toBe("a b c");
  });

  it("drops false, null, undefined and empty strings", () => {
    expect(cx("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("returns an empty string when nothing is truthy", () => {
    expect(cx(false, null)).toBe("");
  });
});
