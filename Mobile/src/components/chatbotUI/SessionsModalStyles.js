import { StyleSheet } from "react-native";
import { clampScale, scale } from "../../utils/layoutScale";

export default StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(9, 6, 10, 0.65)",
    justifyContent: "center",
    padding: scale(16)
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject
  },
  sheet: {
    borderRadius: scale(20),
    maxHeight: "80%",
    borderWidth: 1,
    paddingBottom: scale(20),
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4
    },
    elevation: 4
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: scale(20),
    paddingTop: scale(20),
    paddingBottom: scale(14),
    borderBottomWidth: 1
  },
  title: {
    fontSize: clampScale(18, 16, 20),
    fontWeight: "900"
  },
  closeButton: {
    width: scale(32),
    aspectRatio: 1,
    borderRadius: scale(16),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1
  },
  newChatButton: {
    marginHorizontal: scale(20),
    marginTop: scale(14),
    paddingVertical: scale(12),
    borderRadius: scale(12),
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2
    }
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  newChatButtonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: clampScale(14, 12, 16)
  },
  listContent: {
    paddingHorizontal: scale(20),
    paddingTop: scale(10),
    paddingBottom: scale(20)
  },
  sessionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: scale(12),
    paddingHorizontal: scale(14),
    borderRadius: scale(12),
    borderWidth: 1,
    marginBottom: scale(8),
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2
    },
    elevation: 1
  },
  sessionItemActive: {
    borderWidth: 1.5
  },
  sessionPressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: scale(10)
  },
  sessionTitle: {
    fontSize: clampScale(14, 12, 16),
    fontWeight: "600",
    flex: 1
  },
  sessionTitleActive: {
    fontWeight: "800"
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8)
  },
  actionIconButton: {
    padding: scale(4)
  },
  renameContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: scale(8)
  },
  renameInput: {
    flex: 1,
    borderRadius: scale(8),
    borderWidth: 1,
    paddingVertical: scale(6),
    paddingHorizontal: scale(10),
    fontSize: clampScale(13, 11, 15)
  },
  confirmBtn: {
    width: scale(30),
    aspectRatio: 1,
    borderRadius: scale(6),
    alignItems: "center",
    justifyContent: "center"
  },
  cancelBtn: {
    width: scale(30),
    aspectRatio: 1,
    borderRadius: scale(6),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scale(48)
  },
  emptyText: {
    fontSize: clampScale(13, 11, 15),
    fontWeight: "600"
  }
});
