import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/color";
import styles from "../styles/home.styles";
import { API_URL } from "../../constants/api";
import { useAuthStore } from "../../store/authStore";

export default function OwnerHome() {
  const { token, logout } = useAuthStore();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_URL}/bookings/ownerBookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const data = await res.json();
  
      if (res.ok && Array.isArray(data)) {
        setBookings(data);
      } else {
        console.warn("Unexpected bookings data:", data);
        setBookings([]); // fallback
      }
  
    } catch (err) {
      console.error("Error fetching bookings:", err.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };
  const STATUS_COLORS = {
    PENDING: COLORS.primary,
    CONFIRMED: "#1976D2",
    CANCELLED: "#767676",
    EXPIRED: COLORS.textSecondary,
  };
  

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");

      Alert.alert("Success", `Booking ${newStatus.toLowerCase()} successfully.`);
      fetchBookings();
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />;
  }

  return (
    <ScrollView style={{ padding: 20, backgroundColor: COLORS.background }}>
      <Text style={styles.quickTextTitle}>📦 Your Trip Bookings</Text>
      {/* <TouchableOpacity onPress={logout}>
        <Text style={{ color: COLORS.primary, marginTop: 20 }}>Logout</Text>
      </TouchableOpacity> */}

      {bookings.length === 0 && (
        <Text style={{ marginTop: 20, color: COLORS.textSecondary }}>No bookings yet.</Text>
        
      )}

      {/* {bookings.map((booking) => ( */}
      {Array.isArray(bookings) && bookings.map((booking) => (
         <View
         key={booking.id}
         style={{
           marginTop: 16,
           padding: 16,
           backgroundColor: COLORS.cardBackground,
           borderRadius: 12,
           borderColor: COLORS.border,
           borderWidth: 1,
           shadowColor: COLORS.black,
           shadowOpacity: 0.05,
           shadowRadius: 6,
           shadowOffset: { width: 0, height: 2 },
         }}
       >
         <Text style={{ fontWeight: "600", fontSize: 16, color: COLORS.textDark }}>
           {booking.user.name} booked {booking.seatsBooked} seat(s)
         </Text>
     
         <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 2 }}>
           📞 Phone: {booking.user.phone || 'N/A'}
         </Text>
     
         <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 4 }}>
           🛣️ Trip: {booking.trip?.origin} → {booking.trip?.destination}
         </Text>
     
         <Text style={{ color: COLORS.textSecondary, fontSize: 13, marginTop: 2 }}>
           📅 Date: {new Date(booking.trip?.date).toLocaleDateString()} at {booking.trip?.time}
         </Text>
     
         {/* Status Tag */}
         <View
           style={{
             backgroundColor: (STATUS_COLORS[booking.status] || COLORS.primary) + "20",
             paddingHorizontal: 8,
             paddingVertical: 4,
             borderRadius: 6,
             alignSelf: "flex-start",
             marginTop: 10,
           }}
         >
           <Text style={{ color: STATUS_COLORS[booking.status] || COLORS.primary, fontWeight: "600" }}>
             {booking.status}
           </Text>
         </View>
     
         {/* Confirm / Cancel Buttons */}
         {booking.status === "PENDING" && (
           <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
             <TouchableOpacity
               onPress={() => updateBookingStatus(booking.id, "CONFIRMED")}
               style={{
                 backgroundColor: "#1976D2",
                 padding: 10,
                 borderRadius: 8,
                 flex: 1,
                 alignItems: "center",
               }}
             >
               <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
               <Text style={{ color: "#fff" }}>Confirm</Text>
             </TouchableOpacity>
     
             <TouchableOpacity
               onPress={() => updateBookingStatus(booking.id, "CANCELLED")}
               style={{
                 backgroundColor: "#767676",
                 padding: 10,
                 borderRadius: 8,
                 flex: 1,
                 alignItems: "center",
               }}
             >
               <Ionicons name="close-circle-outline" size={18} color="#fff" />
               <Text style={{ color: "#fff" }}>Cancel</Text>
             </TouchableOpacity>
           </View>
         )}
       </View>
     ))}
    </ScrollView>
  );
}
