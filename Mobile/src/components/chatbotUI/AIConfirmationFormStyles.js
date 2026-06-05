import { Platform, StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";

export default StyleSheet.create({
  card: {
    backgroundColor: COLORS.BG,
    borderWidth: 1,
    borderColor: COLORS.ROSE_MIST,
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    width: "100%",
    shadowColor: COLORS.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6
  },
  headerIcon: {
    fontSize: 18
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.PRIMARY_DARK
  },
  promptText: {
    fontSize: 12,
    color: COLORS.TEXT,
    lineHeight: 16,
    marginBottom: 10,
    fontStyle: "italic"
  },
  fieldsContainer: {
    gap: 8,
    marginBottom: 12
  },
  fieldWrapper: {
    flexDirection: "column",
    gap: 4
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.TEXT_SECONDARY
  },
  input: {
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontSize: 13,
    color: COLORS.TEXT
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  pickerButtonText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.TEXT
  },
  pickerArrow: {
    fontSize: 10,
    color: COLORS.TEXT_MUTED,
    marginLeft: 6
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4
  },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  confirmBtn: {
    backgroundColor: COLORS.INCOME
  },
  confirmBtnText: {
    color: COLORS.WHITE,
    fontWeight: "700",
    fontSize: 13
  },
  cancelBtn: {
    backgroundColor: COLORS.CARD,
    borderWidth: 1,
    borderColor: COLORS.CARD_BORDER
  },
  cancelBtnText: {
    color: COLORS.TEXT_SECONDARY,
    fontWeight: "700",
    fontSize: 13
  },
  btnDisabled: {
    opacity: 0.5
  }
});
