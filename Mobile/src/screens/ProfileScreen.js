import React, { useContext } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../components/AuthContext";
import { COLORS } from "../constants/colors";

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "-"}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, signOut } = useContext(AuthContext);

  const fullName = user?.fullName || "Người dùng";
  const email = user?.email || "Chưa có email";
  const initial = fullName.slice(0, 1).toUpperCase();
  const profileImageUrl = user?.profileImageUrl || "";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        {profileImageUrl ? (
          <Image source={{ uri: profileImageUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        )}

        <View style={styles.heroInfo}>
          <Text style={styles.heroName}>{fullName}</Text>
          <Text style={styles.heroEmail}>{email}</Text>
          <View style={styles.planChip}>
            <Text style={styles.planChipText}>{user?.subscriptionPlan || "FREE"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
        <InfoRow label="Họ và tên" value={fullName} />
        <InfoRow label="Email" value={email} />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Gói dịch vụ</Text>
        <InfoRow label="Gói hiện tại" value={user?.subscriptionPlan || "FREE"} />
        <InfoRow label="Trạng thái" value={user?.subscriptionStatus || "NONE"} />
      </View>

      <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("EditProfile")}>
        <Text style={styles.primaryButtonText}>Chỉnh sửa hồ sơ</Text>
      </Pressable>
      <Pressable style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24
  },
  heroCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: COLORS.PRIMARY,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: COLORS.CARD_BORDER
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "800"
  },
  heroInfo: {
    marginLeft: 12,
    flex: 1
  },
  heroName: {
    color: COLORS.TEXT,
    fontSize: 18,
    fontWeight: "800"
  },
  heroEmail: {
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2
  },
  planChip: {
    alignSelf: "flex-start",
    marginTop: 8,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: COLORS.ROSE_MIST,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER
  },
  planChipText: {
    color: COLORS.PRIMARY,
    fontWeight: "800",
    fontSize: 12
  },
  sectionCard: {
    backgroundColor: COLORS.CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    padding: 12,
    marginBottom: 12
  },
  sectionTitle: {
    color: COLORS.TEXT,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BG
  },
  infoLabel: {
    color: COLORS.TEXT_SECONDARY
  },
  infoValue: {
    color: COLORS.TEXT,
    fontWeight: "700",
    maxWidth: "62%",
    textAlign: "right"
  },
  primaryButton: {
    marginTop: 2,
    marginBottom: 10,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 13
  },
  primaryButtonText: {
    color: COLORS.WHITE,
    fontWeight: "800"
  },
  secondaryButton: {
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    alignItems: "center",
    paddingVertical: 13,
    marginBottom: 10
  },
  secondaryButtonText: {
    color: COLORS.TEXT,
    fontWeight: "700"
  },
  logoutButton: {
    backgroundColor: COLORS.EXPENSE_LIGHT,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecdca",
    alignItems: "center",
    paddingVertical: 13
  },
  logoutText: {
    color: COLORS.EXPENSE,
    fontWeight: "800"
  }
});