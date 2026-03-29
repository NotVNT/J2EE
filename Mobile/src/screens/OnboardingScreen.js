import React, { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import devbotLogo from "../assets/devbot.png";

const { width } = Dimensions.get("window");

export const ONBOARDING_KEY = "botdev_onboarding_done";

const SLIDES = [
  {
    id: "plan",
    title: "Theo Dõi Mọi Dòng Tiền",
    subtitle: "Quản lý thu chi trong một giao diện gọn gàng, dễ theo dõi."
  },
  {
    id: "insight",
    title: "Nhận Biết Nhanh Xu Hướng",
    subtitle: "Xem thống kê trực quan để đưa ra quyết định tài chính nhanh hơn."
  },
  {
    id: "control",
    title: "Chủ Động Tài Chính",
    subtitle: "Đặt mục tiêu, giữ ngân sách và tăng trưởng cùng botdev."
  }
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const listRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastIndex = SLIDES.length - 1;
  const isLastSlide = currentIndex === lastIndex;

  const dots = useMemo(
    () =>
      SLIDES.map((slide, index) => (
        <View key={slide.id} style={[styles.dot, index === currentIndex && styles.dotActive]} />
      )),
    [currentIndex]
  );

  const finishOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, "1");
    navigation.replace("Login");
  };

  const handleNext = async () => {
    if (isLastSlide) {
      await finishOnboarding();
      return;
    }

    const nextIndex = currentIndex + 1;
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setCurrentIndex(nextIndex);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0]?.index != null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View style={styles.container}>
      <View style={styles.bgGlowTop} />
      <View style={styles.bgGlowBottom} />

      <View style={styles.headerRow}>
        <Image source={devbotLogo} style={styles.brandLogo} resizeMode="contain" />
        <Pressable onPress={finishOnboarding}>
          <Text style={styles.skipText}>Bỏ qua</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.iconBubble}>
              <Text style={styles.iconText}>$</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dotsRow}>{dots}</View>
        <Pressable style={styles.ctaButton} onPress={handleNext}>
          <Text style={styles.ctaText}>{isLastSlide ? "Bắt đầu" : "Tiếp tục"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#05070b",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 26
  },
  bgGlowTop: {
    position: "absolute",
    top: -90,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(58, 255, 98, 0.24)"
  },
  bgGlowBottom: {
    position: "absolute",
    right: -120,
    bottom: -90,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(58, 255, 98, 0.14)"
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  brandLogo: {
    width: 150,
    height: 46
  },
  skipText: {
    color: "#9bb0a1",
    fontSize: 14,
    fontWeight: "600"
  },
  slide: {
    width: width - 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12
  },
  iconBubble: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: "rgba(110, 255, 139, 0.32)",
    backgroundColor: "rgba(84, 255, 111, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 26
  },
  iconText: {
    color: "#58f05d",
    fontSize: 52,
    fontWeight: "800"
  },
  title: {
    color: "#f2f8f3",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.3
  },
  subtitle: {
    marginTop: 12,
    color: "#a5b2ac",
    textAlign: "center",
    lineHeight: 22,
    fontSize: 15
  },
  footer: {
    marginTop: 18
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    marginBottom: 20
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#35413a"
  },
  dotActive: {
    width: 18,
    backgroundColor: "#58f05d"
  },
  ctaButton: {
    borderRadius: 12,
    backgroundColor: "#39dc3d",
    paddingVertical: 14,
    alignItems: "center"
  },
  ctaText: {
    color: "#082209",
    fontWeight: "800",
    fontSize: 15
  }
});

