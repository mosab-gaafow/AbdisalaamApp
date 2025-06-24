import { StyleSheet } from "react-native";
import COLORS from "../../constants/color";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    alignItems: "center",
  },
  profileCard: {
    backgroundColor: COLORS.cardBackground,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    width: "100%",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    marginTop: 12,
  },
  role: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  infoGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  logoutBtn: {
    marginTop: 30,
    backgroundColor: COLORS.danger || COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutIcon: {
    marginRight: 8,
  },

  summaryCard: {
    marginTop: 20,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: COLORS.textDark,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statBox: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  
});
