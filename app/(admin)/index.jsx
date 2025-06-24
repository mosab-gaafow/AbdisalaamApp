import { View, Text, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/admin.home.styles";
import COLORS from "../../constants/color";
import { API_URL } from "../../constants/api";
import { useAuthStore } from "../../store/authStore";
import RefreshButton from "../components/RefreshButton";

export default function AdminHome() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true); // for first load only

  const fetchSummaryStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/summaryStats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log(res)
      const data = await res.json();
      // console.log(data)
      setStats(data);
    } catch (err) {
      console.error("Error fetching summary stats:", err.message);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryStats();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#EAF4FF", padding: 20 }}>
      <Text style={styles.quickTextTitle}>👑 Welcome, Admin!</Text>

      <RefreshButton onRefresh={fetchSummaryStats} loading={loading} />

      {initialLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16, marginTop: 10 }}>
          <View style={styles.quickBox}>
            <Ionicons name="people-outline" size={30} color={COLORS.primary} />
            <Text style={styles.quickTextTitle}>{stats?.totalUsers ?? 0}</Text>
            <Text style={styles.quickTextSub}>Users</Text>
          </View>

          <View style={styles.quickBox}>
            <Ionicons name="car-sport-sharp" size={30} color={COLORS.primary} />
            <Text style={styles.quickTextTitle}>{stats?.totalTrips ?? 0}</Text>
            <Text style={styles.quickTextSub}>Trips</Text>
          </View>

          <View style={styles.quickBox}>
            <Ionicons name="car-outline" size={30} color={COLORS.primary} />
            <Text style={styles.quickTextTitle}>{stats?.totalVehicles ?? 0}</Text>
            <Text style={styles.quickTextSub}>Vehicles</Text>
          </View>

          <View style={styles.quickBox}>
            <Ionicons name="document-text-outline" size={30} color={COLORS.primary} />
            <Text style={styles.quickTextTitle}>{stats?.totalBookings ?? 0}</Text>
            <Text style={styles.quickTextSub}>Bookings</Text>
          </View>
        </View>
      )}

      {stats?.recentUsers?.length > 0 && (
        <View style={{ marginTop: 30 }}>
          <Text style={[styles.quickTextTitle, { fontSize: 18, marginBottom: 10 }]}>
            🧑‍💼 Recently Registered Users
          </Text>

          {stats.recentUsers.map((user, index) => (
            <View
              key={user.id}
              style={{
                backgroundColor: COLORS.cardBackground,
                padding: 12,
                borderRadius: 12,
                marginBottom: 12,
                borderColor: COLORS.border,
                borderWidth: 1,
              }}
            >
              <Text style={{ color: COLORS.textPrimary, fontWeight: "600", fontSize: 15 }}>
                {index + 1}. {user.name}
              </Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 13 }}>{user.email}</Text>
              <Text style={{ color: COLORS.primary, fontSize: 13, textTransform: "capitalize", marginTop: 4 }}>
                Role: {user.role}
              </Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: 12, marginTop: 2 }}>
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
