import React, { useContext } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";

function MenuCard({ title, description, onPress, emoji }) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View>
        <Text style={styles.cardTitle}>{emoji} {title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

export default function MoreScreen() {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <Text style={styles.name}>{user?.fullName || "Người dùng"}</Text>
        <Text style={styles.email}>{user?.email || "-"}</Text>
      </View>

      <MenuCard
        emoji="👤"
        title="Hồ sơ"
        description="Cập nhật thông tin và mật khẩu"
        onPress={() => navigation.navigate("Profile")}
      />

      <MenuCard
        emoji="🗂️"
        title="Danh mục"
        description="Quản lý danh mục thu và chi"
        onPress={() => navigation.navigate("Category")}
      />

      <MenuCard
        emoji="🔎"
        title="Lọc giao dịch"
        description="Lọc nâng cao theo ngày, từ khóa, sắp xếp"
        onPress={() => navigation.navigate("Filter")}
      />

      <MenuCard
        emoji="💳"
        title="Thanh toán"
        description="Nâng cấp gói và đồng bộ trạng thái thanh toán"
        onPress={() => navigation.navigate("Payment")}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 10 },
  profileCard: {
    backgroundColor: "#0f172a",
    borderRadius: 14,
    padding: 16,
    marginBottom: 4
  },
  name: { color: "#fff", fontWeight: "700", fontSize: 18 },
  email: { color: "#cbd5e1", marginTop: 2 },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  cardTitle: { color: "#0f172a", fontWeight: "700", fontSize: 16 },
  cardDescription: { color: "#64748b", marginTop: 4 },
  arrow: { color: "#94a3b8", fontSize: 24, fontWeight: "700" }
});
