import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700"
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16
  },
  actionIcon: {
    padding: 4
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0
  },
  listContent: {
    paddingBottom: 24
  },
  listHeader: {
    marginBottom: 16
  },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16
  },
  segmentContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    marginBottom: 16
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10
  },
  segmentButtonActive: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.16,
    shadowRadius: 1.5
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: "750"
  },
  segmentButtonTextActive: {
    color: "#FFF"
  },
  monthNavBtn: {
    padding: 4
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: "600"
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 8
  },
  weekdayText: {
    width: "14%",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600"
  },
  calendarGrid: {
    marginBottom: 16
  },
  calendarDayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 2,
    paddingBottom: 4
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500"
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
    height: 4
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2
  },
  summaryCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    elevation: 1,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2
  },
  summaryCol: {
    flex: 1,
    alignItems: "center"
  },
  summaryDivider: {
    width: 1,
    height: "80%",
    alignSelf: "center"
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: "500",
    marginBottom: 4
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "700"
  },
  dateGroupContainer: {
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 0.5
  },
  groupHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    marginBottom: 8
  },
  groupDateText: {
    fontSize: 12,
    fontWeight: "700"
  },
  groupTotalRow: {
    flexDirection: "row",
    gap: 8
  },
  groupTotalText: {
    fontSize: 11,
    fontWeight: "600"
  },
  rowWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8
  },
  rowTexts: {
    marginLeft: 10,
    flex: 1
  },
  rowName: {
    fontSize: 14,
    fontWeight: "600"
  },
  rowNote: {
    fontSize: 11,
    marginTop: 2
  },
  rowAmount: {
    fontSize: 14,
    fontWeight: "700"
  },
  rowRight: {
    alignItems: "flex-end",
    minWidth: 104
  },
  rowActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 5
  },
  rowActionButton: {
    width: 28,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 4
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18
  }
});
