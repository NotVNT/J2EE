import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, useAppColors } from "../../constants/colors";
import StatusBadge from "../ui/StatusBadge";

export default function ProfileHero({ user, onPress }) {
  const colors = useAppColors();
  const fullName = user?.fullName || "Người dùng";
  const email = user?.email || "Chưa có email";
  const profileImageUrl = user?.profileImageUrl || "";
  const initial = fullName.slice(0, 1).toUpperCase();
  const plan = user?.subscriptionPlan || "FREE";

  return (
    <Pressable style={({ pressed }) => [styles.profileHeroCard, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }, pressed && styles.profileHeroCardPressed]} onPress={onPress}>
      {profileImageUrl ? (
        <Image source={{ uri: profileImageUrl }} style={[styles.heroAvatar, { borderColor: colors.PRIMARY_LIGHT }]} />
      ) : (
        <View style={[styles.heroAvatarPlaceholder, { backgroundColor: colors.PRIMARY }]}>
          <Text style={styles.heroAvatarText}>{initial}</Text>
        </View>
      )}
      <View style={styles.heroTextWrap}>
        <View style={styles.nameRow}>
          <Text style={[styles.heroName, { color: colors.TEXT }]} numberOfLines={1}>{fullName}</Text>
          <StatusBadge plan={plan} style={styles.statusBadge} />
        </View>
        <Text style={[styles.heroEmail, { color: colors.TEXT_SECONDARY }]} numberOfLines={1}>{email}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.TEXT_MUTED} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  profileHeroCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },
  profileHeroCardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  heroAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
  },
  heroAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  heroAvatarText: {
    color: COLORS.WHITE,
    fontWeight: "800",
    fontSize: 22,
  },
  heroTextWrap: {
    marginLeft: 14,
    flex: 1,
    justifyContent: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  heroName: {
    fontSize: 16,
    fontWeight: "800",
    maxWidth: "60%",
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  heroEmail: {
    fontSize: 13,
    marginTop: 4,
  },
});
