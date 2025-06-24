import { View, Text, TouchableOpacity, TextInput, Alert, Modal, Button } from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import COLORS from "../../constants/color";
import { API_URL } from "../../constants/api";
import { StyleSheet } from 'react-native';
import { router } from "expo-router";

export default function Profile() {
  const { user, logout, token } = useAuthStore();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, totalTrips: 0, totalVehicles: 0 });

  // const handleLogout = () => {
  //   Alert.alert("Logout", "Are you sure you want to logout?", [
  //     { text: "Cancel", style: "cancel" },
  //     { text: "Logout", onPress: () => logout() },
  //   ]);
  // };


  const handleLogout = () => {
  Alert.alert(
    "Logout",  // Title of the alert
    "Are you sure you want to logout?",  // Message of the alert
    [
      {
        text: "Cancel",  // The text for the cancel button
        style: "cancel",  // Makes the cancel button styled as "cancel"
      },
      {
        text: "Logout",  // The text for the logout button
        onPress: () => {
          logout();  // Call the logout function
          router.push("/login");  // Redirect to the login page after logout
        },  // Action when "Logout" button is pressed
      },
    ]
  );
};

  const handleSave = async () => {
    if (!name || !email || !phone) {
      return Alert.alert("Error", "Name, Email, and Phone cannot be empty");
    }
    
    if (password && password !== confirmPassword) {
      return Alert.alert("Error", "Passwords do not match");
    }

    // Call the backend API to save the updated profile
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
        setModalVisible(false);
      } else {
        Alert.alert("Error", data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "An error occurred while updating your profile");
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/vehcilestats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      }
    } catch (e) {
      console.error("Stats fetch error:", e.message);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <View style={ownerStyle.container}>
      <View style={ownerStyle.profileCard}>
        <Ionicons name="person-circle-outline" size={80} color={COLORS.primary} />
        <Text style={ownerStyle.name}>{user?.name}</Text>
        <Text style={ownerStyle.role}>🛡️ {user?.role?.toUpperCase()}</Text>

        {/* Display user's details */}
        <View style={ownerStyle.detailsSection}>
          <Text style={ownerStyle.detailsText}>Email: {user?.email}</Text>
          <Text style={ownerStyle.detailsText}>Phone: {user?.phone}</Text>
        </View>

        {/* <TouchableOpacity style={ownerStyle.editBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="create-outline" size={20} color="#fff" style={ownerStyle.logoutIcon} />
          <Text style={ownerStyle.logoutText}>Edit Profile</Text>
        </TouchableOpacity> */}
        <TouchableOpacity 
  style={ownerStyle.editBtn} 
  onPress={() => {
    setPassword(""); // Clear password field
    setConfirmPassword(""); // Clear confirm password field
    setModalVisible(true); // Open the modal
  }}
>
  <Ionicons name="create-outline" size={20} color="#fff" style={ownerStyle.logoutIcon} />
  <Text style={ownerStyle.logoutText}>Edit Profile</Text>
</TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={ownerStyle.modalBackground}>
          <View style={ownerStyle.modalContainer}>
            <TextInput
              style={ownerStyle.inputField}
              value={name}
              onChangeText={setName}
              placeholder="Name"
            />
            <TextInput
              style={ownerStyle.inputField}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
            />
            <TextInput
              style={ownerStyle.inputField}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone"
              keyboardType="phone-pad"
            />
           <TextInput
  style={ownerStyle.inputField}
  value={password}
  onChangeText={setPassword}
  placeholder="New Password"
  secureTextEntry={!editing} // Show password when editing
/>

<TextInput
  style={ownerStyle.inputField}
  value={confirmPassword}
  onChangeText={setConfirmPassword}
  placeholder="Confirm Password"
  secureTextEntry={!editing} // Show confirm password when editing
/>
            <TouchableOpacity style={ownerStyle.saveBtn} onPress={handleSave}>
              <Text style={ownerStyle.saveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={ownerStyle.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={ownerStyle.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Styled Logout Button */}
      <TouchableOpacity style={ownerStyle.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" style={ownerStyle.logoutIcon} />
        <Text style={ownerStyle.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={ownerStyle.summaryCard}>
        <Text style={ownerStyle.sectionTitle}>📊 Summary</Text>
        <View style={ownerStyle.statsGrid}>
          <View style={ownerStyle.statBox}>
            <Text style={ownerStyle.statValue}>{stats.totalVehicles}</Text>
            <Text style={ownerStyle.statLabel}>Vehicles</Text>
          </View>
          <View style={ownerStyle.statBox}>
            <Text style={ownerStyle.statValue}>{stats.totalTrips}</Text>
            <Text style={ownerStyle.statLabel}>Trips</Text>
          </View>
          <View style={ownerStyle.statBox}>
            <Text style={ownerStyle.statValue}>{stats.totalUsers}</Text>
            <Text style={ownerStyle.statLabel}>Users</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const ownerStyle = StyleSheet.create({
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
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  role: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  detailsSection: {
    marginTop: 10,
    paddingHorizontal: 20,
    alignItems: "flex-start",
  },
  detailsText: {
    fontSize: 16,
    color: COLORS.textSecondary,
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
    color: COLORS.primary, // Change icon color to a custom primary color
    padding: 5,
    backgroundColor: COLORS.white, // Optional: Add background to make it pop
    borderRadius: 50, // Optional: Round the background
  },
  logoutText: {
    fontSize: 16,
    color: "#fff",
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
  
  // Styled Logout Button at the top right
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
  summaryCard: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  statBox: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 5,
    width: '30%',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

