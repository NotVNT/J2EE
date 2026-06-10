import { StyleSheet } from "react-native";
import { scale } from "../../utils/layoutScale";

export default StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    padding: scale(14),
    paddingBottom: scale(100)
  },
  sectionContainer: {
    borderRadius: scale(16),
    borderWidth: 1,
    padding: scale(16),
    marginBottom: scale(14),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: scale(14)
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: scale(2)
  },
  amountInput: {
    fontSize: scale(30),
    fontWeight: "800",
    textAlign: "center",
    paddingVertical: scale(6),
    borderBottomWidth: 1.5,
    marginBottom: scale(16)
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: scale(6)
  },
  input: {
    borderRadius: scale(10),
    borderWidth: 1,
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
    marginBottom: scale(12),
    fontSize: 14
  },
  mutedText: {
    fontSize: 13,
    marginBottom: scale(12)
  },
  jarsSection: {
    marginBottom: scale(4)
  },
  jarsContainer: {
    paddingVertical: scale(2),
    flexDirection: "row",
    gap: scale(8)
  },
  jarItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: scale(10),
    borderWidth: 1.5,
    paddingHorizontal: scale(10),
    paddingVertical: scale(8),
    marginRight: scale(4),
    minWidth: scale(130)
  },
  jarEmojiBox: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(6),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(8)
  },
  jarEmoji: {
    fontSize: 15
  },
  jarInfoText: {
    flex: 1
  },
  jarName: {
    fontSize: 13,
    fontWeight: "600"
  },
  jarBalance: {
    fontSize: 10,
    marginTop: scale(1)
  },
  splitBanner: {
    borderRadius: scale(10),
    borderWidth: 1,
    padding: scale(12),
    marginBottom: scale(12)
  },
  splitTitle: {
    fontWeight: "700",
    fontSize: 14,
    marginBottom: scale(4)
  },
  splitText: {
    fontSize: 13,
    marginBottom: scale(2)
  },
  splitMyShare: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: scale(4)
  },
  importBanner: {
    borderRadius: scale(12),
    borderWidth: 1.5,
    borderStyle: "dashed",
    paddingVertical: scale(12),
    paddingHorizontal: scale(14),
    marginBottom: scale(4),
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2
  },
  importBannerScanning: {
    opacity: 0.7
  },
  importBannerInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10)
  },
  importBannerIconBox: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    alignItems: "center",
    justifyContent: "center"
  },
  importBannerBody: {
    flex: 1
  },
  importBannerTitle: {
    fontSize: 14,
    fontWeight: "800"
  },
  importBannerSub: {
    fontSize: 11,
    marginTop: scale(1)
  },
  importBannerText: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: scale(6)
  },
  saveButton: {
    borderRadius: scale(12),
    paddingVertical: scale(13),
    alignItems: "center",
    marginTop: scale(16),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2
  },
  saveButtonDisabled: {
    opacity: 0.6
  },
  saveButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 16
  }
});
