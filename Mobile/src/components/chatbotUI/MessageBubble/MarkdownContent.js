import React from "react";
import { Text, View } from "react-native";
import { parseChatMarkdown } from "../../../utils/chatMarkdown";
import styles from "./styles";

function InlineMarkdown({ colors, segments, style }) {
  return (
    <Text style={style}>
      {segments.map((segment, index) => (
        <Text
          key={`${segment.text}-${index}`}
          style={[
            segment.type === "bold" && styles.markdownBold,
            segment.type === "code" && [styles.inlineCode, { backgroundColor: colors.BG, color: colors.PRIMARY }]
          ]}
        >
          {segment.text}
        </Text>
      ))}
    </Text>
  );
}

export default function MarkdownContent({ colors, isError, text }) {
  const blocks = parseChatMarkdown(text);
  if (!blocks.length) return null;

  return (
    <View style={styles.markdownContainer}>
      {blocks.map((block, blockIndex) => {
        if (block.type === "heading") {
          return (
            <InlineMarkdown
              key={`heading-${blockIndex}`}
              colors={colors}
              segments={block.segments}
              style={[styles.markdownHeading, block.level > 1 && styles.markdownSubheading, { color: colors.TEXT }]}
            />
          );
        }

        if (block.type === "bulletList" || block.type === "orderedList") {
          return (
            <View key={`list-${blockIndex}`} style={styles.markdownList}>
              {block.items.map((item, itemIndex) => (
                <View key={`item-${blockIndex}-${itemIndex}`} style={styles.markdownListItem}>
                  <Text style={[styles.markdownBullet, { color: colors.PRIMARY }]}>
                    {block.type === "orderedList" ? `${itemIndex + 1}.` : "•"}
                  </Text>
                  <InlineMarkdown colors={colors} segments={item} style={[styles.markdownText, { color: colors.TEXT }]} />
                </View>
              ))}
            </View>
          );
        }

        if (block.type === "quote") {
          return (
            <View key={`quote-${blockIndex}`} style={[styles.markdownQuote, { backgroundColor: colors.BG, borderLeftColor: colors.PRIMARY }]}>
              <InlineMarkdown colors={colors} segments={block.segments} style={[styles.markdownText, { color: colors.TEXT_SECONDARY }]} />
            </View>
          );
        }

        if (block.type === "codeBlock") {
          return (
            <View key={`code-${blockIndex}`} style={[styles.codeBlock, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER }]}>
              <Text style={[styles.codeBlockText, { color: colors.TEXT }]}>{block.text}</Text>
            </View>
          );
        }

        return (
          <InlineMarkdown
            key={`paragraph-${blockIndex}`}
            colors={colors}
            segments={block.segments}
            style={[styles.markdownText, isError ? styles.errorText : { color: colors.TEXT }]}
          />
        );
      })}
    </View>
  );
}
