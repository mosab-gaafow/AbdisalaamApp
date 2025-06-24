// components/RefreshButton.jsx
import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/color";

export default function RefreshButton({ onRefresh, loading }) {
  return (
    <TouchableOpacity
      onPress={onRefresh}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.primary,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        alignSelf: "flex-end",
        marginBottom: 10,
      }}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Ionicons name="refresh" size={18} color="#fff" style={{ marginRight: 6 }} />
      )}
      <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
        Refresh
      </Text>
    </TouchableOpacity>
  );
}
