import { StyleSheet } from "react-native";
import COLORS from "../../constants/color";

const styles = StyleSheet.create({
  quickBox: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickTextTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: 8,
  },
  quickTextSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
});

export default styles;
