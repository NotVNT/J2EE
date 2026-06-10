import { Platform, StyleSheet } from "react-native";

export default StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(9, 6, 10, 0.58)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: {
      width: 0,
      height: 18
    },
    shadowOpacity: Platform.OS === "ios" ? 0.18 : 0.28,
    shadowRadius: 22,
    elevation: 14
  },
  topBeam: {
    height: 6
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14
  },
  headerTextWrap: {
    flex: 1,
    alignItems: "flex-start"
  },
  badgeContainer: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 7
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 24
  },
  message: {
    marginHorizontal: 20,
    marginTop: 2,
    fontSize: 15,
    lineHeight: 22
  },
  actions: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20
  },
  actionsMulti: {
    flexDirection: "row",
    gap: 12
  },
  actionsStacked: {
    gap: 10
  },
  actionButton: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14
  },
  actionButtonMulti: {
    flex: 1
  },
  actionButtonStacked: {
    width: "100%"
  },
  actionText: {
    fontSize: 15,
    fontWeight: "900"
  },
  primaryText: {
    color: "#FFFFFF"
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }]
  }
});
