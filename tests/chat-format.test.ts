import { describe, expect, it } from "vitest";
import { formatAnswer, nextRevealLength } from "@/lib/chat/format";

describe("formatAnswer", () => {
  it("splits paragraphs on blank lines and joins wrapped lines", () => {
    expect(
      formatAnswer("Yes, Starter is free.\nIt covers 3 clients.\n\nUpgrade any time."),
    ).toEqual([
      { kind: "paragraph", text: "Yes, Starter is free. It covers 3 clients." },
      { kind: "paragraph", text: "Upgrade any time." },
    ]);
  });

  it("turns dash, star and numbered lines into lists", () => {
    expect(
      formatAnswer("Pro vs Team:\n- Pro: $12\n* Team: $29\n\n1. Add a client\n2) Send"),
    ).toEqual([
      { kind: "paragraph", text: "Pro vs Team:" },
      { kind: "list", ordered: false, items: ["Pro: $12", "Team: $29"] },
      { kind: "list", ordered: true, items: ["Add a client", "Send"] },
    ]);
  });

  it("drops markdown emphasis, code and heading marks", () => {
    expect(formatAnswer("## Plans\n**Pro** is `$12` a month.\n- __Team__ adds seats")).toEqual([
      { kind: "paragraph", text: "Plans Pro is $12 a month." },
      { kind: "list", ordered: false, items: ["Team adds seats"] },
    ]);
  });

  it("copes with half-streamed text", () => {
    expect(formatAnswer("")).toEqual([]);
    expect(formatAnswer("Sure:\n- ")).toEqual([{ kind: "paragraph", text: "Sure:" }]);
    expect(formatAnswer("**Pro")).toEqual([{ kind: "paragraph", text: "**Pro" }]);
  });
});

describe("nextRevealLength", () => {
  const text = "Pro is $12 a month and suits a freelancer working alone.";

  it("moves forward and stops on a word boundary", () => {
    const next = nextRevealLength(text, 0);
    expect(next).toBeGreaterThan(0);
    expect(text[next] ?? " ").toMatch(/\s/);
  });

  it("reaches the end in a handful of frames, never past it", () => {
    let shown = 0;
    let frames = 0;
    while (shown < text.length) {
      shown = nextRevealLength(text, shown);
      frames++;
    }
    expect(shown).toBe(text.length);
    expect(frames).toBeLessThan(20);
    expect(nextRevealLength(text, text.length)).toBe(text.length);
  });

  it("shows a half-received last word as soon as it has arrived", () => {
    expect(nextRevealLength("Team is $2", 8)).toBe(10);
  });
});
