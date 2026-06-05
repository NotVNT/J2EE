import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, useAppColors } from "../../constants/colors";

export default function ProfileAvatarPicker({ fullName, onPickImage, onRemoveImage, previewUri }) {
  const colors = useAppColors();

  return (
    <View style={styles.avatarSection}>
      <View style={styles.avatarWrap}>
        <View style={[styles.avatarFrame, { backgroundColor: colors.BG, borderColor: colors.CARD_BORDER }]}>
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={[styles.avatarImage, { borderColor: colors.PRIMARY_LIGHT, backgroundColor: colors.BG }]} />
          ) : (
            <View style={[styles.avatarPlaceholder, { borderColor: colors.PRIMARY_LIGHT, backgroundColor: colors.BG }]}>
              <Text style={[styles.avatarPlaceholderText, { color: colors.TEXT }]}>{(fullName || "U").slice(0, 1).toUpperCase()}</Text>
            </View>
          )}
        </View>

        <Pressable style={[styles.avatarEditButton, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]} onPress={onPickImage}>
          <Ionicons name="camera" size={16} color={colors.PRIMARY} />
        </Pressable>
      </View>

      {previewUri ? (
        <Pressable style={styles.removeAvatarButton} onPress={onRemoveImage}>
          <Text style={[styles.removeAvatarButtonText, { color: colors.EXPENSE }]}>Xóa ảnh hiện tại</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: "center",
    marginBottom: 12
  },
  avatarWrap: {
    position: "relative"
  },
  avatarFrame: {
    width: 108,
    height: 108,
    borderRadius: 54,
    padding: 6,
    borderWidth: 2,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    borderWidth: 1,
    overflow: "hidden"
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden"
  },
  avatarPlaceholderText: {
    fontWeight: "800",
    fontSize: 32
  },
  avatarEditButton: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },
  removeAvatarButton: {
    marginTop: 8
  },
  removeAvatarButtonText: {
    fontWeight: "600",
    fontSize: 13
  }
});
