import React, { useEffect, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import devbotLogo from "../assets/devbot.png";

export default function DevbotLoader({
  text = "Devbot đang xử lý...",
  fullScreen = false,
  overlay = false
}) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true
        })
      ])
    );

    const dotLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false
        }),
        Animated.timing(dotAnim, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false
        })
      ])
    );

    spinLoop.start();
    pulseLoop.start();
    dotLoop.start();

    return () => {
      spinLoop.stop();
      pulseLoop.stop();
      dotLoop.stop();
    };
  }, [dotAnim, pulseAnim, spinAnim]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"]
  });

  const reverseRotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["360deg", "0deg"]
  });

  const dots = dotAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [".", "..."]
  });

  return (
    <View
      style={[
        styles.wrapper,
        fullScreen && styles.fullScreen,
        overlay && styles.overlay
      ]}
    >
      <View style={styles.loaderBox}>
        <Animated.View style={[styles.ringOuter, { transform: [{ rotate }] }]} />
        <Animated.View style={[styles.ringInner, { transform: [{ rotate: reverseRotate }] }]} />

        <Animated.View style={[styles.logoWrap, { transform: [{ scale: pulseAnim }] }]}>
          <Image source={devbotLogo} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <View style={styles.textRow}>
          <Text style={styles.text}>{text}</Text>
          <Animated.Text style={styles.text}>{dots}</Animated.Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: "center",
    alignItems: "center"
  },
  fullScreen: {
    flex: 1,
    backgroundColor: "#05070b"
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
    backgroundColor: "rgba(5, 7, 11, 0.88)"
  },
  loaderBox: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center"
  },
  ringOuter: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 3,
    borderTopColor: "#39dc3d",
    borderRightColor: "#39dc3d",
    borderBottomColor: "rgba(57, 220, 61, 0.16)",
    borderLeftColor: "rgba(57, 220, 61, 0.16)"
  },
  ringInner: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderTopColor: "#89f98c",
    borderLeftColor: "#89f98c",
    borderRightColor: "rgba(137, 249, 140, 0.18)",
    borderBottomColor: "rgba(137, 249, 140, 0.18)"
  },
  logoWrap: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#090f0c",
    borderWidth: 1,
    borderColor: "#1f3528",
    alignItems: "center",
    justifyContent: "center"
  },
  logo: {
    width: 86,
    height: 36
  },
  textRow: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center"
  },
  text: {
    color: "#d8ffe1",
    fontWeight: "600",
    letterSpacing: 0.2
  }
});
