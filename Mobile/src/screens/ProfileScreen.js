import React, { useContext } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../components/AuthContext";

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
    backgroundColor: "#f3f5f9"
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24
  },
  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#0f766e",
    alignItems: "center",
    justifyContent: "center"
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#e2e8f0"
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
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "800"
  },
  heroEmail: {
    color: "#64748b",
    marginTop: 2
  },
  planChip: {
    alignSelf: "flex-start",
    marginTop: 8,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#ecfdf3",
    borderWidth: 1,
    borderColor: "#bbf7d0"
  },
  planChipText: {
    color: "#047857",
    fontWeight: "800",
    fontSize: 12
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 12,
    marginBottom: 12
  },
  sectionTitle: {
    color: "#0f172a",
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
    borderBottomColor: "#f1f5f9"
  },
  infoLabel: {
    color: "#64748b"
  },
  infoValue: {
    color: "#0f172a",
    fontWeight: "700",
    maxWidth: "62%",
    textAlign: "right"
  },
  primaryButton: {
    marginTop: 2,
    marginBottom: 10,
    backgroundColor: "#0f766e",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 13
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "800"
  },
  secondaryButton: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    paddingVertical: 13,
    marginBottom: 10
  },
  secondaryButtonText: {
    color: "#334155",
    fontWeight: "700"
  },
  logoutButton: {
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
    alignItems: "center",
    paddingVertical: 13
  },
  logoutText: {
    color: "#b91c1c",
    fontWeight: "800"
  }
});
