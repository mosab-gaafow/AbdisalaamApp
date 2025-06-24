import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";  // Zustand store import
import { API_URL } from "../../constants/api";
import COLORS from "../../constants/color";
import { StyleSheet } from "react-native";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Profile() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { user, token, logout } = useAuthStore();  // Access user from Zustand store
  const router = useRouter();

  // Fetch bookings
  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/bookings/myBookings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await response.text();
      const data = JSON.parse(text);
      if (!response.ok) throw new Error(data.message || "Failed to fetch bookings");

      setBookings(data);
    } catch (e) {
      console.error("Error fetching bookings", e.message);
      Alert.alert("Error", "There was a problem fetching your bookings");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle refreshing of bookings
  const handleRefresh = async () => {
    setRefreshing(true);
    await sleep(500);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
    }
    fetchData();
  }, [user]);

  // Delete booking by ID
  const handleDeleteBooking = (bookingId) => {
    Alert.alert(
      "Delete Booking",
      "Are you sure you want to delete this booking?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              const data = await response.json();
              if (response.ok) {
                Alert.alert("Success", "Booking deleted successfully.");
                // Refresh the bookings after deletion
                fetchData();
              } else {
                Alert.alert("Error", data.error || "Failed to delete booking");
              }
            } catch (error) {
              console.error("Error deleting booking:", error);
              Alert.alert("Error", "An error occurred while deleting the booking");
            }
          },
        },
      ]
    );
  };

  // Render each booking item
  const renderBookingItem = ({ item }) => (
    <View style={travelerStyle.bookItem}>
      <View style={travelerStyle.bookInfo}>
        <Text style={travelerStyle.bookTitle}>
          {item.trip.origin} → {item.trip.destination}
        </Text>
        <Text style={travelerStyle.bookCaption}>
          {item.seatsBooked} seat(s) • {new Date(item.trip.date).toLocaleDateString()} at {item.trip.time}
        </Text>
        <Text style={travelerStyle.bookDate}>Booked on: {new Date(item.bookingTime).toLocaleDateString()}</Text>
        <Text
          style={{
            color: item.status === "CONFIRMED" ? "green" : "red",
            fontWeight: "600",
            marginTop: 4,
          }}
        >
          Status: {item.status}
        </Text>
        {/* Add delete button */}
        <TouchableOpacity
          style={travelerStyle.deleteBtn}
          onPress={() => handleDeleteBooking(item.id)}
        >
          <Ionicons name="trash-outline" size={40} color="red" />
          <Text style={travelerStyle.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Handle user profile update (name, email, phone, password)
  const handleSave = async () => {
    if (!name || !email || !phone) {
      return Alert.alert("Error", "Name, Email, and Phone cannot be empty");
    }

    if (password && password !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match");
    }

    try {
      const response = await fetch(`${API_URL}/admin/update-profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert("Success", "Profile updated successfully.");
        setEditing(false);
      } else {
        Alert.alert("Error", data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "An error occurred while updating your profile");
    }
  };

  // Logout confirmation
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          onPress: () => {
            logout();
            router.push("/login");
          },
        },
      ]
    );
  };

  if (isLoading && !refreshing) return <ActivityIndicator size="large" color={COLORS.primary} />;

  return (
    <View style={travelerStyle.container}>
      <View style={travelerStyle.profileCard}>
        <Ionicons name="person-circle-outline" size={100} color={COLORS.primary} />
        <Text style={travelerStyle.name}>{name}</Text>
        <View style={travelerStyle.userInfo}>
          <Text style={travelerStyle.userInfoText}>Email: {email}</Text>
          <Text style={travelerStyle.userInfoText}>Phone: {phone}</Text>
        </View>
        <Text style={travelerStyle.role}>Traveler</Text>

        <TouchableOpacity style={travelerStyle.editBtn} onPress={() => setEditing(true)}>
          <Ionicons name="create-outline" size={20} color="#fff" style={travelerStyle.logoutIcon} />
          <Text style={travelerStyle.logoutText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Beautiful Logout Button */}
        <TouchableOpacity style={travelerStyle.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#fff" style={travelerStyle.logoutIcon} />
          <Text style={travelerStyle.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal visible={editing} animationType="slide" transparent={true} onRequestClose={() => setEditing(false)}>
        <View style={travelerStyle.modalBackground}>
          <View style={travelerStyle.modalContainer}>
            <TextInput style={travelerStyle.inputField} value={name} onChangeText={setName} placeholder="Name" />
            <TextInput style={travelerStyle.inputField} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
            <TextInput style={travelerStyle.inputField} value={phone} onChangeText={setPhone} placeholder="Phone" keyboardType="phone-pad" />
            <TextInput style={travelerStyle.inputField} value={password} onChangeText={setPassword} placeholder="New Password" secureTextEntry={editing ? false : true} />
            <TextInput style={travelerStyle.inputField} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm Password" secureTextEntry={editing ? false : true} />
            <TouchableOpacity style={travelerStyle.saveBtn} onPress={handleSave}>
              <Text style={travelerStyle.saveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={travelerStyle.cancelBtn} onPress={() => setEditing(false)}>
              <Text style={travelerStyle.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={travelerStyle.booksHeader}>
        <Text style={travelerStyle.booksTitle}>Your Booked Trips</Text>
        <Text style={travelerStyle.booksCount}>{bookings.length} trips</Text>
      </View>

      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={travelerStyle.booksList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} tintColor={COLORS.primary} />}
        ListEmptyComponent={
          <View style={travelerStyle.emptyContainer}>
            <Ionicons name="bus-outline" size={50} color={COLORS.textSecondary} />
            <Text style={travelerStyle.emptyText}>No bookings yet</Text>
            <TouchableOpacity style={travelerStyle.addButton} onPress={() => router.push("/")}>
              <Text style={travelerStyle.addButtonText}>Find Trips</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const travelerStyle = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  profileCard: {
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 5,
  },
  userInfo: {
    marginVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  userInfoText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  role: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  editBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutIcon: {
    marginRight: 5,
  },
  logoutText: {
    fontSize: 16,
    color: "#fff",
  },
  logoutBtn: {
    position: 'absolute', // Absolute positioning
    top: 20, // Distance from the top
    right: 20, // Distance from the right side
    backgroundColor: COLORS.primary, // Change the background color to match the edit profile button
    paddingVertical: 12, // Vertical padding for better spacing
    paddingHorizontal: 18, // Horizontal padding
    borderRadius: 25, // Rounded edges for the button
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000", // Add a shadow for a sleek effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  inputField: {
    height: 40,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  saveText: {
    color: "#fff",
    textAlign: 'center',
    fontSize: 16,
  },
  cancelBtn: {
    backgroundColor: COLORS.secondary,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  cancelText: {
    color: "#fff",
    textAlign: 'center',
    fontSize: 16,
  },
  booksHeader: {
    marginTop: 30,
    marginBottom: 10,
  },
  booksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  booksCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  booksList: {
    paddingBottom: 20,
  },
  bookItem: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  bookInfo: {
    marginBottom: 10,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  bookCaption: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  bookDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginTop: 10,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  addButtonText: {
    fontSize: 16,
    color: "#fff",
  },
 deleteBtn: {
  backgroundColor: COLORS.danger, // Red background for the delete button
  paddingVertical: 8,
  paddingHorizontal: 15,
  borderRadius: 5,
  marginTop: 10,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
},
deleteText: {
  fontSize: 16,
  color: "#fff",  // White color for text to contrast the red background
  marginLeft: 5,   // Space between the icon and text
},

});
