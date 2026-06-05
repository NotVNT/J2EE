import React from "react";
import { Image, View } from "react-native";
import { useAppColors } from "../../../constants/colors";
import appLogo from "../../../assets/applogo.png";
import styles from "./styles";

export default function AssistantAvatar() {
  const colors = useAppColors();

  return (
    <View style={[styles.assistantAvatar, { backgroundColor: colors.ROSE_MIST, borderColor: colors.PRIMARY_LIGHT, shadowColor: colors.PRIMARY }]}>
      <Image source={appLogo} style={styles.assistantAvatarImage} resizeMode="cover" />
    </View>
  );
}
