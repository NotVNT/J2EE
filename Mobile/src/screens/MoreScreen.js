import React, { useContext } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../components/AuthContext";

function UserAvatar({ fullName }) {
  const initial = (fullName || "U").slice(0, 1).toUpperCase();

  return (
    <View style={styles.avatarWrap}>
      <Text style={styles.avatarText}>{initial}</Text>
    </View>
  );
}

function MenuCard({ title, description, tag, onPress }) {
  return (
    <Pressable style={styles.menuCard} onPress={onPress}>
      <View style={styles.menuTagWrap}>
        <Text style={styles.menuTagText}>{tag}</Text>
      </View>

      <View style={styles.menuBody}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuDescription}>{description}</Text>
      </View>
    </Pressable>
  );
}

export default function MoreScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Quản lý tài khoản</Text>
      </View>

      <MenuCard
        tag="TK"
        title="Hồ sơ cá nhân"
        description="Xem chi tiết thông tin tài khoản của bạn"
        onPress={() => navigation.navigate("Profile")}
      />

      <MenuCard
        tag="GOI"
        title="Thanh toán"
        description="Nâng cấp gói và kiểm tra trạng thái giao dịch"
        onPress={() => navigation.navigate("Payment")}
      />

      <MenuCard
        tag="SUA"
        title="Chỉnh sửa hồ sơ"
        description="Cập nhật tên, email, ảnh và mật khẩu"
        onPress={() => navigation.navigate("EditProfile")}
      />
     
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f5f9",
    paddingTop: 50
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24
  },
  heroCard: {
    backgroundColor: "#111827",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#111827",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#374151"
  },
  avatarText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 20
  },
  heroTextWrap: {
    marginLeft: 12,
    flex: 1
  },
  heroTitle: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "600"
  },
  heroName: {
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "800",
    marginTop: 2
  },
  heroEmail: {
    color: "#cbd5e1",
    marginTop: 12,
    fontSize: 14
  },
  sectionHeaderRow: {
    marginBottom: 8,
    marginTop: 2
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800"
  },
  menuCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center"
  },
  menuTagWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#e8fff4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#bbf7d0"
  },
  menuTagText: {
    color: "#047857",
    fontSize: 11,
    fontWeight: "800"
  },
  menuBody: {
    flex: 1,
    paddingHorizontal: 12
  },
  menuTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "700"
  },
  menuDescription: {
    color: "#64748b",
    marginTop: 3,
    lineHeight: 18
  },
  menuArrow: {
    color: "#94a3b8",
    fontSize: 24,
    fontWeight: "700"
  },
  noteCard: {
    marginTop: 4,
    backgroundColor: "#eff6ff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    padding: 12
  },
  noteTitle: {
    color: "#1d4ed8",
    fontWeight: "800",
    marginBottom: 4
  },
  noteText: {
    color: "#1e3a8a",
    lineHeight: 18
  }
});
