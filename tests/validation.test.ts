import { describe, expect, it } from "vitest";
import { validateEmail } from "@/lib/validation";

describe("validateEmail", () => {
  it("accepts a normal address and trims the spaces around it", () => {
    expect(validateEmail("  maya@wren.studio ")).toEqual({ ok: true, email: "maya@wren.studio" });
    expect(validateEmail("tom.b+invoices@example.co.uk")).toEqual({
      ok: true,
      email: "tom.b+invoices@example.co.uk",
    });
  });

  it("asks for an address when the field is empty or only spaces", () => {
    expect(validateEmail("")).toEqual({ ok: false, error: "required" });
    expect(validateEmail("   ")).toEqual({ ok: false, error: "required" });
  });

  it.each(["maya", "maya@", "@wren.studio", "maya@wren", "maya wren@studio.io", "a@b..com"])(
    "rejects %j as invalid",
    (value) => {
      expect(validateEmail(value)).toEqual({ ok: false, error: "invalid" });
    },
  );

  it("rejects an address longer than 254 characters", () => {
    const long = `${"a".repeat(64)}@${"b".repeat(186)}.com`;
    expect(long).toHaveLength(255);
    expect(validateEmail(long)).toEqual({ ok: false, error: "invalid" });
  });
});
