import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppColors } from "../constants/colors";
import AppIcon from "../components/ui/AppIcon";
import { LinearGradient } from "expo-linear-gradient";

// ─── Speed Dial sub-actions with SpendBee colors & icons ───
const SUB_ACTIONS = [
  {
    key: "Income",
    icon: "wallet-outline",
    label: "Thu nhập",
    tx: -110,
    ty: -25,
    color: "#22C55E", // SpendBee green
  },
  {
    key: "Budget",
    icon: "pie-chart-outline",
    label: "Ngân sách",
    tx: -75,
    ty: -85,
    color: "#A855F7", // SpendBee purple
  },
  {
    key: "Forecast",
    icon: "trending-up-outline",
    label: "Dự báo",
    tx: 0,
    ty: -115,
    color: "#26A69A", // SpendBee teal
  },
  {
    key: "Goal",
    icon: "flag-outline",
    label: "Mục tiêu",
    tx: 75,
    ty: -85,
    color: "#3B82F6", // SpendBee blue
  },
  {
    key: "Chat",
    icon: "chatbubble-ellipses-outline",
    label: "Chat AI",
    tx: 110,
    ty: -25,
    color: "#7C4DFF", // SpendBee violet
  },
];

// ─── FAB button (inside tab bar) ─────────────────────────
export function FloatingTabButton({ onPress, isOpen }) {
  const colors = useAppColors();
  
  // Staggered rotate animation for main FAB icon
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "135deg"],
  });

  return (
    <Pressable onPress={onPress}>
      <LinearGradient
        colors={['#7C4DFF', '#A855F7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.fabMain,
          {
            shadowColor: '#7C4DFF',
          },
        ]}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <AppIcon name="add" size={28} color={colors.WHITE || '#FFFFFF'} />
        </Animated.View>
      </LinearGradient>
    </Pressable>
  );
}

// ─── Speed Dial overlay + sub-buttons ────────────────────
export default function FloatingQuickMenu({ visible, onClose, onSelectRoute, focusedKey }) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  const colors = useAppColors();

  // Control mount state to play closing animation before unmounting
  const [active, setActive] = useState(false);

  // Staggered animated values for each sub-button
  const animations = useRef(
    SUB_ACTIONS.map(() => ({
      tx: new Animated.Value(0),
      ty: new Animated.Value(0),
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      setActive(true);
      
      // Fan out animation (springy & staggered)
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.stagger(
          40,
          animations.map((anim, i) =>
            Animated.parallel([
              Animated.spring(anim.tx, {
                toValue: SUB_ACTIONS[i].tx,
                friction: 6.5,
                tension: 80,
                useNativeDriver: true,
              }),
              Animated.spring(anim.ty, {
                toValue: SUB_ACTIONS[i].ty,
                friction: 6.5,
                tension: 80,
                useNativeDriver: true,
              }),
              Animated.spring(anim.scale, {
                toValue: 1,
                friction: 6.5,
                tension: 80,
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 1,
                duration: 180,
                useNativeDriver: true,
              }),
            ])
          )
        ),
      ]).start();
    } else {
      // Fan in animation
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.stagger(
          30,
          animations.map((anim) =>
            Animated.parallel([
              Animated.timing(anim.tx, {
                toValue: 0,
                duration: 180,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(anim.ty, {
                toValue: 0,
                duration: 180,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(anim.scale, {
                toValue: 0,
                duration: 180,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
              }),
            ])
          )
        ),
      ]).start(() => {
        setActive(false);
      });
    }
  }, [visible]);

  if (!visible && !active) return null;

  // Calculate bottom anchor centered with the FAB button
  const bottomOffset = Math.max(insets.bottom, 8) + 36;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Semi-transparent backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: overlayOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Safe area for interactive floating buttons */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <View style={[styles.subButtonsContainer, { bottom: bottomOffset }]} pointerEvents="box-none">
          {SUB_ACTIONS.map((action, i) => {
            const anim = animations[i];
            const isFocused = focusedKey === action.key;

            return (
              <Animated.View
                key={action.key}
                style={[
                  styles.subButtonWrapper,
                  {
                    transform: [
                      { translateX: anim.tx },
                      { translateY: anim.ty },
                      { scale: anim.scale },
                    ],
                    opacity: anim.opacity,
                  },
                ]}
                pointerEvents="box-none"
              >
                {/* Responsive Label - Centered above the button */}
                <View
                  style={[
                    styles.labelBubble,
                    {
                      backgroundColor: colors.CARD,
                      borderColor: colors.CARD_BORDER,
                      shadowColor: colors.SHADOW_COLOR || "#000",
                    },
                    isFocused && { backgroundColor: action.color, borderColor: action.color },
                  ]}
                >
                  <Text
                    style={[
                      styles.subLabel,
                      { color: colors.TEXT },
                      isFocused && { color: "#FFFFFF" },
                    ]}
                    numberOfLines={1}
                  >
                    {action.label}
                  </Text>
                </View>

                {/* Sub Action Circle Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.subButton,
                    {
                      backgroundColor: action.color,
                      shadowColor: action.color,
                    },
                    isFocused && styles.subButtonFocused,
                    pressed && { opacity: 0.85, transform: [{ scale: 0.92 }] },
                  ]}
                  onPress={() => onSelectRoute(action.key)}
                >
                  <AppIcon name={action.icon} size={22} color="#FFFFFF" />
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────
const styles = StyleSheet.create({
  // ── Main FAB ──────────────────────────────────────────
  fabMain: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -22,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    alignSelf: "center",
  },

  // ── Backdrop ──────────────────────────────────────────
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },

  // ── Sub-buttons area ──────────────────────────────────
  subButtonsContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  subButtonWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
  },

  // ── Circular button ────────────────────────────────────
  subButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 5,
  },

  // ── Label bubble centered above button ────────────────
  labelBubble: {
    position: "absolute",
    bottom: 54, // Perfectly elevated above the 48px button
    alignSelf: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
    minWidth: 72,
    alignItems: "center",
    justifyContent: "center",
  },

  subLabel: {
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },

  // ── Focused sub-action ────────────────────────────────
  subButtonFocused: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
    transform: [{ scale: 1.1 }],
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
});
