// SVG path helpers for the small charts in the mockups. Pure functions, so they're unit tested.

export interface Point {
  x: number;
  y: number;
}

/** Rounds to 2 decimals so the paths stay short and identical on server and client. */
const r = (n: number) => Math.round(n * 100) / 100;

/**
 * A smooth line through every point: a Catmull-Rom spline written as cubic Béziers. The curve
 * passes exactly through each point, so the chart's dots sit on the line.
 */
export function smoothLine(points: readonly Point[]): string {
  const first = points[0];
  if (!first || points.length < 2) throw new RangeError("A line needs at least two points");

  let d = `M${r(first.x)} ${r(first.y)}`;
  for (let i = 0; i < points.length - 1; i++) {
    // The neighbours either side shape the curve; at the ends, the end point stands in.
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    if (!p0 || !p1 || !p2 || !p3) continue;

    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${r(c1.x)} ${r(c1.y)} ${r(c2.x)} ${r(c2.y)} ${r(p2.x)} ${r(p2.y)}`;
  }
  return d;
}

/** The same line, closed down to `baselineY` to make a filled area. */
export function smoothArea(points: readonly Point[], baselineY: number): string {
  const first = points[0];
  const last = points.at(-1);
  if (!first || !last) throw new RangeError("An area needs at least two points");
  return `${smoothLine(points)} L${r(last.x)} ${r(baselineY)} L${r(first.x)} ${r(baselineY)} Z`;
}

/**
 * Spreads values evenly across `width` and scales them into `height` (SVG y runs downwards,
 * so bigger values sit higher). `max` is the value that reaches the top.
 */
export function toPoints(values: readonly number[], width: number, height: number, max: number) {
  if (values.length < 2) throw new RangeError("A chart needs at least two values");
  if (max <= 0) throw new RangeError("The chart's max must be above zero");
  const step = width / (values.length - 1);
  return values.map((value, i): Point => ({ x: i * step, y: height - (value / max) * height }));
}
