import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAppColors } from "../../constants/colors";
import { scale } from "../../utils/layoutScale";

export default function JarSelector({ jarId, jars, loading, onChange }) {
  const colors = useAppColors();
  const { t } = useTranslation();

  return (
    <View style={[styles.jarsCard, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}>
      <Text style={[styles.jarsLabel, { color: colors.TEXT_SECONDARY }]}>{t("jarSelector.title")}</Text>
      {loading ? (
        <Text style={[styles.mutedText, { color: colors.TEXT_MUTED }]}>{t("jarSelector.loading")}</Text>
      ) : jars.length === 0 ? (
        <Text style={[styles.mutedText, { color: colors.TEXT_MUTED }]}>{t("jarSelector.empty")}</Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.jarsRow}
        >
          {jars.map((jar) => {
            const isSelected = String(jar.id) === jarId;
            const accentColor = jar.color || colors.PRIMARY;
            return (
              <Pressable
                key={jar.id}
                onPress={() => onChange(isSelected ? "" : String(jar.id))}
                style={[
                  styles.jarItem,
                  { backgroundColor: colors.APP_BACKGROUND || colors.BG, borderColor: colors.BORDER || colors.CARD_BORDER },
                  isSelected && {
                    borderColor: accentColor,
                    backgroundColor: `${accentColor}12`
                  }
                ]}
              >
                <View style={[styles.jarEmojiBox, { backgroundColor: `${accentColor}18` }]}>
                  <Text style={styles.jarEmoji}>{jar.icon || "🏺"}</Text>
                </View>
                <Text
                  style={[
                    styles.jarName,
                    { color: colors.TEXT },
                    isSelected && {
                      color: accentColor,
                      fontWeight: "800"
                    }
                  ]}
                >
                  {jar.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  jarsCard: {
    borderRadius: scale(14),
    borderWidth: 1,
    padding: scale(12),
    marginBottom: scale(4)
  },
  jarsLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: scale(8)
  },
  mutedText: {
    fontSize: 12,
  },
  jarsRow: {
    flexDirection: "row",
    gap: scale(8)
  },
  jarItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: scale(10),
    borderWidth: 1,
    paddingHorizontal: scale(10),
    paddingVertical: scale(6),
    marginRight: scale(6)
  },
  jarEmojiBox: {
    width: scale(22),
    height: scale(22),
    borderRadius: scale(5),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(6)
  },
  jarEmoji: {
    fontSize: scale(12)
  },
  jarName: {
    fontSize: 12,
    fontWeight: "600"
  }
});
