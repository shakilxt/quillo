/**
 * Turns an assistant answer into paragraphs and short lists for display. The prompt asks for plain
 * text with "- " lists, but models slip in markdown now and then, so stray emphasis and heading
 * marks are dropped rather than shown. Works on partial text too, as the answer streams in.
 */

export type AnswerBlock =
  { kind: "paragraph"; text: string } | { kind: "list"; ordered: boolean; items: string[] };

const BULLET = /^\s*[-*•]\s+/;
const NUMBERED = /^\s*\d+[.)]\s+/;

function clean(text: string): string {
  return text
    .replace(/^\s*#{1,6}\s+/, "")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

export function formatAnswer(answer: string): AnswerBlock[] {
  const blocks: AnswerBlock[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  };

  for (const line of answer.split(/\r?\n/)) {
    const ordered = NUMBERED.test(line);
    if (ordered || BULLET.test(line)) {
      flushParagraph();
      const item = clean(line.replace(ordered ? NUMBERED : BULLET, ""));
      if (!item) continue;
      const last = blocks.at(-1);
      if (last?.kind === "list" && last.ordered === ordered) last.items.push(item);
      else blocks.push({ kind: "list", ordered, items: [item] });
      continue;
    }

    const text = clean(line);
    if (text) paragraph.push(text);
    else flushParagraph();
  }
  flushParagraph();
  return blocks;
}

/**
 * How much of a streaming answer to show on the next animation frame. Gemini sends an answer in
 * a few large chunks, so the panel reveals what has arrived a few words at a time: roughly an
 * eighteenth of what's left per frame (at least 3 characters), always ending on a whole word.
 */
export function nextRevealLength(text: string, shown: number): number {
  if (shown >= text.length) return text.length;
  const target = shown + Math.max(3, Math.ceil((text.length - shown) / 18));
  const wordEnd = text.slice(target).search(/\s/);
  return wordEnd === -1 ? text.length : target + wordEnd;
}
