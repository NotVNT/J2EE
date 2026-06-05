import { Platform, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.CHAT_BG
  },
  keyboardView: {
    flex: 1
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: COLORS.CHAT_BUBBLE,
    borderWidth: 1,
    borderColor: COLORS.CHAT_BORDER,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    marginTop: 6
  },
  loadingText: {
    color: COLORS.CHAT_MUTED,
    fontSize: 12
  },
  voiceModalContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between"
  },
  voiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 40 : 20
  },
  voiceTitle: {
    fontSize: 18,
    fontWeight: "700"
  },
  voiceCloseBtn: {
    padding: 8
  },
  voiceBody: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 80,
    marginBottom: 40
  },
  voiceDisclaimerText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    fontStyle: "italic"
  },
  voiceFooter: {
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? 40 : 20
  },
  voiceHintText: {
    fontSize: 14,
    marginBottom: 16,
    fontWeight: "500"
  },
  voiceMicButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  }
});
