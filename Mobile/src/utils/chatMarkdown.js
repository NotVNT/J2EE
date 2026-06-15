function stripThinkBlocks(value) {
  return String(value || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<think>[\s\S]*$/i, "")
    .trim();
}

function parseInlineMarkdown(value) {
  const segments = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(value)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: value.slice(lastIndex, match.index), type: "text" });
    }

    const token = match[0];
    if (token.startsWith("**")) {
      segments.push({ text: token.slice(2, -2), type: "bold" });
    } else {
      segments.push({ text: token.slice(1, -1), type: "code" });
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < value.length) {
    segments.push({ text: value.slice(lastIndex), type: "text" });
  }

  return segments.length ? segments : [{ text: value, type: "text" }];
}

function createTextBlock(type, lines, extra = {}) {
  return {
    ...extra,
    type,
    segments: parseInlineMarkdown(lines.join(" ").trim())
  };
}

function parseList(lines, startIndex, ordered) {
  const items = [];
  let index = startIndex;
  const pattern = ordered ? /^\s*\d+[.)]\s+(.+)$/ : /^\s*[-*]\s+(.+)$/;

  while (index < lines.length) {
    const match = lines[index].match(pattern);
    if (!match) break;
    items.push(parseInlineMarkdown(match[1].trim()));
    index += 1;
  }

  return {
    block: { type: ordered ? "orderedList" : "bulletList", items },
    nextIndex: index
  };
}

function parseChatMarkdown(input) {
  const text = stripThinkBlocks(input);
  if (!text) return [];

  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const codeLines = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: "codeBlock", text: codeLines.join("\n") });
      index += index < lines.length ? 1 : 0;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        segments: parseInlineMarkdown(headingMatch[2].trim())
      });
      index += 1;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const parsed = parseList(lines, index, false);
      blocks.push(parsed.block);
      index = parsed.nextIndex;
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const parsed = parseList(lines, index, true);
      blocks.push(parsed.block);
      index = parsed.nextIndex;
      continue;
    }

    if (/^\s*>\s+/.test(line)) {
      const quoteLines = [];
      while (index < lines.length && /^\s*>\s+/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^\s*>\s+/, ""));
        index += 1;
      }
      blocks.push(createTextBlock("quote", quoteLines));
      continue;
    }

    const paragraphLines = [trimmed];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith("```") &&
      !/^(#{1,3})\s+/.test(lines[index].trim()) &&
      !/^\s*[-*]\s+/.test(lines[index]) &&
      !/^\s*\d+[.)]\s+/.test(lines[index]) &&
      !/^\s*>\s+/.test(lines[index])
    ) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }
    blocks.push(createTextBlock("paragraph", paragraphLines));
  }

  return blocks;
}

module.exports = {
  parseChatMarkdown,
  parseInlineMarkdown,
  stripThinkBlocks
};
