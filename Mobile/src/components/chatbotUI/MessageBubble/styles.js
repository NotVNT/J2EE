import { StyleSheet } from "react-native";

export default StyleSheet.create({
  messageRow: {
    width: "100%",
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "center"
  },
  botRow: {
    alignItems: "flex-start"
  },
  userRow: {
    justifyContent: "flex-end"
  },
  editButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1
  },
  messageColumn: {
    maxWidth: "80%",
    flexDirection: "column"
  },
  userColumn: {
    alignItems: "flex-end"
  },
  bubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2
    },
    elevation: 1
  },
  botBubble: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  userBubble: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 4
  },
  systemBubble: {
    borderStyle: "dashed",
    borderRadius: 16
  },
  errorBubble: {
    backgroundColor: "rgba(231, 111, 81, 0.12)",
    borderColor: "rgba(231, 111, 81, 0.22)",
    borderRadius: 16
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20
  },
  markdownContainer: {
    gap: 8
  },
  markdownText: {
    fontSize: 14,
    lineHeight: 21
  },
  markdownHeading: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "900",
    marginBottom: 2
  },
  markdownSubheading: {
    fontSize: 15,
    lineHeight: 21
  },
  markdownBold: {
    fontWeight: "900"
  },
  inlineCode: {
    fontFamily: "monospace",
    fontSize: 13,
    borderRadius: 6,
    paddingHorizontal: 4
  },
  markdownList: {
    gap: 6
  },
  markdownListItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8
  },
  markdownBullet: {
    width: 22,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "900",
    textAlign: "right"
  },
  markdownQuote: {
    borderLeftWidth: 3,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  codeBlock: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10
  },
  codeBlockText: {
    fontFamily: "monospace",
    fontSize: 12,
    lineHeight: 18
  },
  errorText: {
    color: "#ff847c"
  },
  modelFootprint: {
    fontSize: 9,
    fontWeight: "700",
    marginTop: 8,
    alignSelf: "flex-end"
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    marginHorizontal: 4
  },
  userTime: {
    textAlign: "right"
  },
  confirmedStatusWrapper: {
    paddingVertical: 2
  },
  confirmedStatusText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4cdad9"
  },
  undoContainer: {
    flexDirection: "column",
    gap: 8
  },
  undoText: {
    fontSize: 14
  },
  undoBtn: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(76, 218, 217, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(76, 218, 217, 0.25)",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12
  },
  btnIconRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  undoBtnText: {
    color: "#4cdad9",
    fontSize: 12,
    fontWeight: "700"
  },
  retryBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "rgba(232, 89, 122, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(232, 89, 122, 0.22)",
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: "700"
  },
  assistantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2
    },
    elevation: 2,
    overflow: "hidden"
  },
  assistantAvatarImage: {
    width: 40,
    height: 40
  }
});
