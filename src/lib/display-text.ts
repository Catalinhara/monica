/**
 * Normalize author text so line breaks show in the UI.
 * Accepts real newlines and common mistakes: "/n", "\\n".
 */
export function normalizeDisplayText(value: string): string {
  return value.replace(/\\n/g, "\n").replace(/\/n/g, "\n");
}

/**
 * Split text with simple **bold** markers into React-ready parts.
 * Only supports non-nested **segments**.
 */
export function parseBoldSegments(
  value: string,
): Array<{ text: string; bold: boolean }> {
  const source = normalizeDisplayText(value);
  const parts: Array<{ text: string; bold: boolean }> = [];
  const re = /\*\*(.+?)\*\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) {
    if (match.index > last) {
      parts.push({ text: source.slice(last, match.index), bold: false });
    }
    parts.push({ text: match[1], bold: true });
    last = match.index + match[0].length;
  }
  if (last < source.length) {
    parts.push({ text: source.slice(last), bold: false });
  }
  if (parts.length === 0) {
    parts.push({ text: source, bold: false });
  }
  return parts;
}
