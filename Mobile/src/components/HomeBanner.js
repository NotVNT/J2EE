import React from "react";
import { Image, StyleSheet, View } from "react-native";
import bannerImage from "../assets/moneymanagerbanner.avif";

export default function HomeBanner() {
  return (
    <View style={styles.wrapper}>
      <Image source={bannerImage} style={styles.banner} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#dbe3f2",
    backgroundColor: "#ffffff"
  },
  banner: {
    width: "100%",
    height: 122
  }
});
