import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { COLORS } from "../../constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { scale, clampScale } from "../../utils/layoutScale";

export default function SetupProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const email = route.params?.email || "";

  const [fullName, setFullName] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const canProceed = fullName.trim().length > 0;

  const onNext = () => {
    if (!canProceed) return;
    navigation.navigate("CreatePassword", { email, fullName: fullName.trim() });
  };

  const onClear = () => setFullName("");

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <View style={styles.bgGlowTop} />
        <View style={styles.bgGlowBottom} />

        <View style={styles.body}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Họ và tên (bắt buộc)</Text>
            <View style={[styles.inputWrap, isFocused && styles.inputWrapFocused]}>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Ví dụ: Nguyễn Văn A"
                placeholderTextColor={COLORS.DARK_TEXT_SECONDARY}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {fullName.length > 0 && (
                <Pressable onPress={onClear} style={styles.clearButton}>
                  <Text style={styles.clearIcon}>✕</Text>
                </Pressable>
              )}
            </View>
          </View>

          <Pressable
            style={[styles.nextButton, !canProceed && styles.nextButtonDisabled]}
            onPress={onNext}
            disabled={!canProceed}
          >
            <Text style={[styles.nextButtonText, !canProceed && styles.nextButtonTextDisabled]}>
              Tiếp theo
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.DARK_BG
  },
  bgGlowTop: {
    position: "absolute",
    top: -120,
    left: -100,
    width: scale(300),
    height: scale(300),
    borderRadius: scale(150),
    backgroundColor: COLORS.PRIMARY_GLOW
  },
  bgGlowBottom: {
    position: "absolute",
    right: -140,
    bottom: -120,
    width: scale(320),
    height: scale(320),
    borderRadius: scale(160),
    backgroundColor: COLORS.PRIMARY_GLOW
  },
  body: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: scale(28),
    paddingBottom: scale(60)
  },
  inputGroup: {
    marginBottom: scale(24)
  },
  inputLabel: {
    color: COLORS.PRIMARY_LIGHT,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: scale(8),
    letterSpacing: 0.3
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.DARK_INPUT_BG,
    borderRadius: scale(12),
    borderWidth: 1.5,
    borderColor: COLORS.DARK_BORDER,
    paddingHorizontal: scale(14),
    height: scale(50)
  },
  inputWrapFocused: {
    borderColor: COLORS.PRIMARY,
    borderWidth: 1.5
  },
  input: {
    flex: 1,
    color: COLORS.DARK_TEXT,
    fontSize: 16
  },
  clearButton: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: COLORS.DARK_TEXT_SECONDARY,
    alignItems: "center",
    justifyContent: "center"
  },
  clearIcon: {
    color: COLORS.DARK_BG,
    fontSize: 12,
    fontWeight: "700"
  },
  nextButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: scale(12),
    height: scale(50),
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: COLORS.DARK_BORDER,
    opacity: 0.5
  },
  nextButtonText: {
    color: COLORS.WHITE || "#FFFFFF",
    fontSize: 16,
    fontWeight: "800"
  },
  nextButtonTextDisabled: {
    color: COLORS.DARK_TEXT_SECONDARY
  }
});
