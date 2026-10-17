import { describe, expect, it } from "vitest";
import { smoothArea, smoothLine, toPoints } from "@/lib/chart";

describe("toPoints", () => {
  it("spreads values across the width and puts the max at the top", () => {
    expect(toPoints([0, 50, 100], 200, 80, 100)).toEqual([
      { x: 0, y: 80 },
      { x: 100, y: 40 },
      { x: 200, y: 0 },
    ]);
  });

  it("needs two values and a positive max", () => {
    expect(() => toPoints([1], 100, 100, 1)).toThrow(RangeError);
    expect(() => toPoints([1, 2], 100, 100, 0)).toThrow(RangeError);
  });
});

describe("smoothLine", () => {
  it("starts at the first point and draws one curve per gap", () => {
    const d = smoothLine([
      { x: 0, y: 10 },
      { x: 50, y: 0 },
      { x: 100, y: 20 },
    ]);
    expect(d.startsWith("M0 10 C")).toBe(true);
    expect(d.match(/C/g)).toHaveLength(2);
  });

  it("passes through every point, ending on the last", () => {
    const points = [
      { x: 0, y: 30 },
      { x: 40, y: 12.5 },
      { x: 80, y: 18 },
      { x: 120, y: 2 },
    ];
    // Each "C x1 y1 x2 y2 x y" segment ends on the next point.
    const segmentEnds = smoothLine(points)
      .split("C")
      .slice(1)
      .map((segment) => segment.trim().split(" ").slice(-2).map(Number));
    expect(segmentEnds).toEqual(points.slice(1).map(({ x, y }) => [x, y]));
  });

  it("draws a straight pair of points as a straight curve", () => {
    expect(
      smoothLine([
        { x: 0, y: 0 },
        { x: 60, y: 30 },
      ]),
    ).toBe("M0 0 C10 5 50 25 60 30");
  });

  it("needs at least two points", () => {
    expect(() => smoothLine([{ x: 0, y: 0 }])).toThrow(RangeError);
    expect(() => smoothLine([])).toThrow(RangeError);
  });
});

describe("smoothArea", () => {
  it("closes the line down to the baseline", () => {
    const d = smoothArea(
      [
        { x: 0, y: 10 },
        { x: 100, y: 0 },
      ],
      40,
    );
    expect(d.endsWith("L100 40 L0 40 Z")).toBe(true);
  });
});
