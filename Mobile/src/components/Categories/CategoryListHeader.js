import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { COLORS, useAppColors } from "../../constants/colors";
import ShowMoreButton from "../common/ShowMoreButton";

export default function CategoryListHeader({ canExpand, hasCategories, onToggle, showAll }) {
  const colors = useAppColors();
  const { t } = useTranslation();

  if (!hasCategories) {
    return null;
  }

  return (
    <View style={styles.listHeader}>
      <Text style={[styles.listTitle, { color: colors.TEXT }]}>{t("recentCategories.title")}</Text>
      <ShowMoreButton visible={canExpand} expanded={showAll} onPress={onToggle} />
    </View>
  );
}

const styles = StyleSheet.create({
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  listTitle: {
    color: COLORS.TEXT,
    fontWeight: "800",
    fontSize: 16
  }
});
