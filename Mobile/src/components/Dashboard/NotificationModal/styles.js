import { StyleSheet } from "react-native";
import { COLORS } from "../../../constants/colors";
import { clampScale, scale } from "../../../utils/layoutScale";

export default StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(9, 6, 10, 0.62)",
    justifyContent: "flex-end",
    paddingHorizontal: scale(10)
  },
  sheet: {
    height: "88%",
    maxHeight: "92%",
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    borderBottomLeftRadius: scale(18),
    borderBottomRightRadius: scale(18),
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    overflow: "hidden"
  },
  header: {
    paddingHorizontal: scale(18),
    paddingTop: scale(16),
    paddingBottom: scale(12),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: scale(12)
  },
  headerTitleBlock: {
    flex: 1
  },
  title: {
    fontSize: clampScale(24, 20, 28),
    fontWeight: "900"
  },
  headerMetaRow: {
    marginTop: scale(8),
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: scale(8)
  },
  headerMetaText: {
    fontSize: clampScale(12, 10, 14),
    fontWeight: "700"
  },
  closeButton: {
    width: scale(38),
    aspectRatio: 1,
    borderRadius: scale(19),
    alignItems: "center",
    justifyContent: "center"
  },
  filterPanel: {
    paddingHorizontal: scale(14),
    paddingVertical: scale(10),
    borderBottomWidth: 1,
    gap: scale(9)
  },
  readFilterGroup: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: scale(12),
    padding: scale(3),
    gap: scale(3)
  },
  readFilterButton: {
    flex: 1,
    minHeight: scale(32),
    borderRadius: scale(9),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scale(10),
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1
  },
  readFilterText: {
    fontSize: clampScale(12, 10, 14),
    fontWeight: "800"
  },
  categoryFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: scale(8)
  },
  categoryChip: {
    flexBasis: "48%",
    flexGrow: 1,
    minHeight: scale(36),
    borderRadius: scale(12),
    borderWidth: 1,
    paddingHorizontal: scale(10),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(6)
  },
  categoryChipText: {
    fontSize: clampScale(12, 10, 14),
    fontWeight: "800"
  },
  selectionBar: {
    minHeight: scale(44),
    paddingHorizontal: scale(14),
    paddingVertical: scale(8),
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: scale(12)
  },
  selectAllRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  selectAllText: {
    fontSize: clampScale(12, 10, 14),
    fontWeight: "800"
  },
  selectButton: {
    width: scale(22),
    aspectRatio: 1,
    borderRadius: scale(7),
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(10)
  },
  deleteSelectedButton: {
    borderRadius: scale(12),
    paddingHorizontal: scale(10),
    paddingVertical: scale(8),
    flexDirection: "row",
    alignItems: "center",
    gap: scale(5)
  },
  deleteSelectedText: {
    fontSize: clampScale(12, 10, 14),
    fontWeight: "900"
  },
  markAllText: {
    fontSize: clampScale(12, 10, 14),
    fontWeight: "800"
  },
  markAllButton: {
    borderRadius: scale(999),
    paddingHorizontal: scale(10),
    paddingVertical: scale(5)
  },
  errorText: {
    marginHorizontal: scale(20),
    marginTop: scale(12),
    padding: scale(10),
    borderRadius: scale(12),
    fontSize: clampScale(13, 11, 15),
    textAlign: "center",
    fontWeight: "700"
  },
  loadingWrap: {
    paddingVertical: scale(48),
    alignItems: "center",
    justifyContent: "center"
  },
  loadingText: {
    marginTop: scale(10),
    fontSize: clampScale(13, 11, 15),
    fontWeight: "600"
  },
  listContent: {
    paddingVertical: scale(4)
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: "center"
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(14),
    paddingVertical: scale(11),
    borderBottomWidth: 1
  },
  itemUnread: {
    backgroundColor: "rgba(232, 89, 122, 0.06)"
  },
  itemIcon: {
    width: scale(36),
    aspectRatio: 1,
    borderRadius: scale(13),
    alignItems: "center",
    justifyContent: "center",
    marginRight: scale(10)
  },
  itemIconText: {
    fontSize: clampScale(18, 16, 22),
    fontWeight: "900"
  },
  itemBody: {
    flex: 1
  },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: scale(8)
  },
  itemTitle: {
    flex: 1,
    fontSize: clampScale(14, 12, 16),
    fontWeight: "700",
    lineHeight: scale(19)
  },
  itemTitleUnread: {
    fontWeight: "900"
  },
  unreadDot: {
    width: scale(8),
    aspectRatio: 1,
    borderRadius: scale(4),
    marginTop: scale(5)
  },
  itemMessage: {
    marginTop: scale(5),
    fontSize: clampScale(13, 11, 15),
    lineHeight: scale(18)
  },
  itemTime: {
    marginTop: scale(7),
    fontSize: clampScale(11, 9, 13),
    fontWeight: "700"
  },
  deleteItemButton: {
    width: scale(32),
    aspectRatio: 1,
    borderRadius: scale(12),
    alignItems: "center",
    justifyContent: "center",
    marginLeft: scale(10)
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: scale(28),
    paddingVertical: scale(48)
  },
  emptyIcon: {
    width: scale(56),
    aspectRatio: 1,
    borderRadius: scale(28),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: scale(14)
  },
  emptyIconText: {
    fontSize: clampScale(24, 20, 28)
  },
  emptyTitle: {
    fontSize: clampScale(16, 14, 18),
    fontWeight: "900",
    marginBottom: scale(6)
  },
  emptyMessage: {
    fontSize: clampScale(13, 11, 15),
    lineHeight: scale(19),
    textAlign: "center"
  }
});
