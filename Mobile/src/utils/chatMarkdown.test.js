const test = require("node:test");
const assert = require("node:assert/strict");

const {
  parseChatMarkdown,
  parseInlineMarkdown,
  stripThinkBlocks
} = require("./chatMarkdown");

test("stripThinkBlocks removes hidden reasoning blocks", () => {
  assert.equal(stripThinkBlocks("Hi<think>private</think> there"), "Hi there");
});

test("stripThinkBlocks removes unfinished hidden reasoning blocks", () => {
  assert.equal(stripThinkBlocks("Hi<think>private reasoning\nthere"), "Hi");
});

test("parseInlineMarkdown preserves bold and inline code segments", () => {
  assert.deepEqual(parseInlineMarkdown("Use **budget** and `jars`"), [
    { text: "Use ", type: "text" },
    { text: "budget", type: "bold" },
    { text: " and ", type: "text" },
    { text: "jars", type: "code" }
  ]);
});

test("parseChatMarkdown parses common assistant response structure", () => {
  const blocks = parseChatMarkdown(`# Plan
Track these:
- **Income**
- Expense

> Keep it simple

\`\`\`
total = income - expense
\`\`\``);

  assert.equal(blocks[0].type, "heading");
  assert.equal(blocks[1].type, "paragraph");
  assert.equal(blocks[2].type, "bulletList");
  assert.equal(blocks[2].items.length, 2);
  assert.equal(blocks[3].type, "quote");
  assert.equal(blocks[4].type, "codeBlock");
});
