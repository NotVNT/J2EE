import React, { useCallback, useContext } from "react";
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../../contexts/AuthContext";
import JarAllocationChart from "../../components/Jars/JarAllocationChart";
import JarCard from "../../components/Jars/JarCard";
import JarDetailView from "../../components/Jars/JarDetailView";
import JarFormView from "../../components/Jars/JarFormView";
import JarOverview from "../../components/Jars/JarOverview";
import JarTransferView from "../../components/Jars/JarTransferView";
import { useAppColors } from "../../constants/colors";
import useJarList from "../../hooks/useJarList";
import { getSafeAreaBottom, getSafeAreaTop } from "../../utils/safeArea";
import AppIcon from "../../components/ui/AppIcon";
import EmptyState from "../../components/ui/EmptyState";
import ScreenBackHeader from "../../components/common/ScreenBackHeader";
import { scale } from "../../utils/layoutScale";

function JarActions({ colors, jarCount, onCreate, onTransfer }) {
  const { t } = useTranslation();

  return (
    <View style={styles.actionsRow}>
      {jarCount >= 2 && (
        <Pressable
          style={[styles.secondaryButton, { backgroundColor: colors.ROSE_MIST, borderColor: colors.CARD_BORDER }]}
          onPress={onTransfer}
        >
          <View style={styles.btnContentRow}>
            <AppIcon name="swap-vertical" size={16} color={colors.PRIMARY} style={styles.btnIconSpacing} />
            <Text style={[styles.secondaryButtonText, { color: colors.PRIMARY }]}>{t("finance.jar.transfer")}</Text>
          </View>
        </Pressable>
      )}
      <Pressable
        style={[styles.primaryButton, { backgroundColor: colors.PRIMARY }]}
        onPress={onCreate}
      >
        <View style={styles.btnContentRow}>
          <AppIcon name="add" size={16} color="#FFF" style={styles.btnIconSpacing} />
          <Text style={styles.primaryButtonText}>{t("finance.jar.create")}</Text>
        </View>
      </Pressable>
    </View>
  );
}

export default function JarScreen() {
  const route = useRoute();

  if (route.name === "JarDetail") return <JarDetailView />;
  if (route.name === "JarForm") return <JarFormView />;
  if (route.name === "JarTransfer") return <JarTransferView />;

  return <JarListRoute />;
}

function JarListRoute() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const colors = useAppColors();
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const jarList = useJarList(user);

  const handleCreateJar = useCallback(() => {
    if (jarList.canCreate) {
      navigation.navigate("JarForm");
      return;
    }

    Alert.alert(
      t("finance.jar.limitTitle"),
      t("finance.jar.limitMessage", { plan: jarList.plan, maxJars: jarList.maxJars }),
      [
        { text: t("auth.common.later"), style: "cancel" },
        { text: t("finance.jar.upgradeNow"), onPress: () => navigation.navigate("SettingTab", { screen: "Payment" }) }
      ]
    );
  }, [jarList.canCreate, jarList.maxJars, jarList.plan, navigation, t]);

  const renderHeader = useCallback(
    () => (
      <View>
        <JarOverview
          jarCount={jarList.jars.length}
          maxJars={jarList.maxJars}
          totalBalance={jarList.totalBalance}
          totalPercentage={jarList.totalPercentage}
        />
        <JarActions
          colors={colors}
          jarCount={jarList.jars.length}
          onCreate={handleCreateJar}
          onTransfer={() => navigation.navigate("JarTransfer")}
        />
        <JarAllocationChart jarCount={jarList.jars.length} slices={jarList.slices} />
        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: colors.TEXT }]}>{t("finance.jar.listTitle")}</Text>
        </View>
      </View>
    ),
    [colors, handleCreateJar, jarList.jars.length, jarList.maxJars, jarList.slices, jarList.totalBalance, jarList.totalPercentage, navigation, t]
  );

  const renderJar = useCallback(
    ({ item }) => (
      <JarCard
        item={item}
        totalBalance={jarList.totalBalance}
        onPress={() => navigation.navigate("JarDetail", { id: item.id, name: item.name })}
      />
    ),
    [jarList.totalBalance, navigation]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.BG, paddingTop: getSafeAreaTop(insets) }]}>
      <ScreenBackHeader title={t("finance.jar.title")} style={styles.screenHeader} />
      <FlatList
        data={jarList.jars}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderJar}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: getSafeAreaBottom(insets) + scale(100) },
          (!jarList.jars || !jarList.jars.length) && styles.listContentEmpty,
        ]}
        refreshControl={<RefreshControl refreshing={jarList.refreshing} onRefresh={jarList.onRefresh} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          !jarList.loading && (
            <EmptyState
              title={t("finance.jar.emptyTitle")}
              description={t("finance.jar.emptyDescription")}
              icon="archive-outline"
              actionTitle={t("finance.jar.firstAction")}
              onActionPress={handleCreateJar}
            />
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenHeader: {
    marginHorizontal: scale(14),
    marginBottom: 0,
  },
  scrollContent: {
    padding: scale(14),
    paddingBottom: scale(100)
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  listHeader: {
    marginTop: scale(8),
    marginBottom: scale(10)
  },
  listTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  actionsRow: {
    flexDirection: "row",
    gap: scale(8),
    marginBottom: scale(12)
  },
  primaryButton: {
    flex: 1,
    borderRadius: scale(12),
    paddingVertical: scale(12),
    alignItems: "center",
    justifyContent: "center"
  },
  primaryButtonText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 14
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: scale(12),
    paddingVertical: scale(12),
    alignItems: "center",
    justifyContent: "center"
  },
  secondaryButtonText: {
    fontWeight: "800",
    fontSize: 14
  },
  btnContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  btnIconSpacing: {
    marginRight: scale(4),
  },
});
