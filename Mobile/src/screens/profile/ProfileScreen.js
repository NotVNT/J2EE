import React, { useContext } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../contexts/AuthContext";
import { COLORS, useAppColors } from "../../constants/colors";
import { getSafeAreaBottom, getSafeAreaTop } from "../../utils/safeArea";
import StatusBadge from "../../components/ui/StatusBadge";

function InfoRow({ colors, label, value, showChevron = false, isLast = false }) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.CARD_BORDER }, isLast && styles.infoRowLast]}>
      <Text style={[styles.infoLabel, { color: colors.TEXT_SECONDARY }]}>{label}</Text>
      <View style={styles.infoValueWrap}>
        <Text style={[styles.infoValue, { color: colors.TEXT }, label === "Số điện thoại" && { color: colors.TEXT_SECONDARY }]}>{value || "-"}</Text>
        {showChevron && <Ionicons name="chevron-forward" size={16} color={colors.TEXT_MUTED} style={{ marginLeft: 6 }} />}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const colors = useAppColors();

  const fullName = user?.fullName || "Người dùng";
  const email = user?.email || "Chưa có email";
  const initial = fullName.slice(0, 1).toUpperCase();
  const profileImageUrl = user?.profileImageUrl || "";
  const subscriptionPlan = String(user?.subscriptionPlan || "FREE").toUpperCase();

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.BG, paddingTop: getSafeAreaTop(insets, 0) }]}>
      
      {/* Top Application Bar matching mockup */}
      <View style={[styles.topAppBar, { backgroundColor: colors.BG }]}>
        <Text style={[styles.appBarTitle, { color: colors.TEXT }]}>Hồ sơ</Text>
      </View>

      <ScrollView style={[styles.container, { backgroundColor: colors.BG }]} contentContainerStyle={[styles.content, { paddingBottom: getSafeAreaBottom(insets) }]} showsVerticalScrollIndicator={false}>
        
        {/* User Profile Header Card */}
        <View style={[styles.heroCard, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}>
          {profileImageUrl ? (
            <Image source={{ uri: profileImageUrl }} style={[styles.avatarImage, { borderColor: colors.PRIMARY_LIGHT }]} />
          ) : (
            <View style={[styles.avatarWrap, { backgroundColor: colors.PRIMARY }]}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          )}

          <View style={styles.heroInfo}>
            <Text style={[styles.heroName, { color: colors.TEXT }]}>{fullName}</Text>
            <Text style={[styles.heroEmail, { color: colors.TEXT_SECONDARY }]}>{email}</Text>
            <StatusBadge plan={subscriptionPlan} style={{ marginTop: 8 }} />
          </View>
        </View>

        {/* Personal Information Group Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.TEXT_SECONDARY }]}>Thông tin cá nhân</Text>
        </View>
        <View style={[styles.sectionCard, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}>
          <InfoRow colors={colors} label="Họ và tên" value={fullName} />
          <InfoRow colors={colors} label="Email" value={email} />
          <InfoRow colors={colors} label="Số điện thoại" value="Chưa cập nhật" showChevron={true} isLast={true} />
        </View>

        {/* Service Plan Group Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.TEXT_SECONDARY }]}>Gói dịch vụ</Text>
        </View>
        <View style={[styles.sectionCard, { backgroundColor: colors.CARD, borderColor: colors.CARD_BORDER }]}>
          <View style={styles.planRow}>
            <Text style={[styles.planLabel, { color: colors.TEXT_SECONDARY }]}>Gói hiện tại</Text>
            <StatusBadge plan={subscriptionPlan} />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topAppBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
  },
  appBarTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
  },
  avatarText: {
    color: COLORS.WHITE,
    fontSize: 24,
    fontWeight: "bold",
  },
  heroInfo: {
    marginLeft: 16,
    flex: 1,
  },
  heroName: {
    fontSize: 18,
    fontWeight: "750",
  },
  heroEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "550",
  },
  infoValueWrap: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "65%",
  },
  infoValue: {
    fontWeight: "600",
    fontSize: 14,
    textAlign: "right",
  },
  planRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  planLabel: {
    fontSize: 14,
    fontWeight: "550",
  },
});
