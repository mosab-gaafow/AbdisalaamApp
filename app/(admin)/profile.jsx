import React, { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { API_URL } from "../../constants/api";
import COLORS from "../../constants/color";

const designStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  profileTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textDark,
  },
  profileCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  formContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  successText: {
    color: COLORS.success,
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
});

export default function AdminProfile() {
  const { token, user, setUser, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    setError("");
    setSuccess("");
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => logout() },
    ]);
  };

  const handleProfileUpdate = async () => {
    // Validate password match if password is provided
    if (profileData.password && profileData.password !== profileData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    // Validate password length if provided
    if (profileData.password && profileData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      // Construct payload with undefined instead of empty strings
      const payload = {
        name: profileData.name || undefined,
        email: profileData.email || undefined,
        phone: profileData.phone || undefined,
        password: profileData.password || undefined,
      };

      const response = await fetch(`${API_URL}/admin/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const textResponse = await response.text();
      const data = textResponse ? JSON.parse(textResponse) : {};

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to update profile");
      }

      // Update local state
      const updatedUser = {
        ...user,
        ...data.user, // Use the returned user data from backend
      };

      await setUser(updatedUser);

      // Update form state
      setProfileData({
        ...updatedUser,
        password: "",
        confirmPassword: "",
      });

      setSuccess("Profile updated successfully!");
      setIsEditing(false);

      // Show alert upon successful profile update
      Alert.alert("Profile Update", "Profile update successful!");
    } catch (err) {
      console.error("Full error details:", {
        message: err.message,
        stack: err.stack,
      });
      setError(err.message.includes("500")
        ? "Server error. Please try again later."
        : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={designStyles.container}>
      <View style={designStyles.profileHeader}>
        <Text style={designStyles.profileTitle}>My Profile</Text>
        <TouchableOpacity onPress={toggleEditMode}>
          <Ionicons
            name={isEditing ? "close-circle" : "settings"}
            size={28}
            color={COLORS.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout}>
          <Ionicons
            name="log-out-outline"
            size={28}
            color={COLORS.error} // Using error color for logout to make it stand out
          />
        </TouchableOpacity>
      </View>

      {!isEditing ? (
        <View style={designStyles.profileCard}>
          <View style={designStyles.infoRow}>
            <Text style={designStyles.infoLabel}>Name:</Text>
            <Text style={designStyles.infoValue}>{user?.name}</Text>
          </View>
          <View style={designStyles.infoRow}>
            <Text style={designStyles.infoLabel}>Email:</Text>
            <Text style={designStyles.infoValue}>{user?.email}</Text>
          </View>
          <View style={designStyles.infoRow}>
            <Text style={designStyles.infoLabel}>Phone:</Text>
            <Text style={designStyles.infoValue}>{user?.phone || "Not provided"}</Text>
          </View>
          <View style={designStyles.infoRow}>
            <Text style={designStyles.infoLabel}>Role:</Text>
            <Text style={designStyles.infoValue}>{user?.role}</Text>
          </View>
        </View>
      ) : (
        <View style={designStyles.formContainer}>
          {error ? <Text style={designStyles.errorText}>{error}</Text> : null}
          {success ? <Text style={designStyles.successText}>{success}</Text> : null}

          <View style={designStyles.inputContainer}>
            <Text style={designStyles.inputLabel}>Full Name</Text>
            <TextInput
              style={designStyles.textInput}
              value={profileData.name}
              onChangeText={(text) => handleInputChange("name", text)}
              placeholder="Enter your full name"
            />
          </View>

          <View style={designStyles.inputContainer}>
            <Text style={designStyles.inputLabel}>Email Address</Text>
            <TextInput
              style={designStyles.textInput}
              value={profileData.email}
              onChangeText={(text) => handleInputChange("email", text)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={designStyles.inputContainer}>
            <Text style={designStyles.inputLabel}>Phone Number</Text>
            <TextInput
              style={designStyles.textInput}
              value={profileData.phone}
              onChangeText={(text) => handleInputChange("phone", text)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>

        <View style={designStyles.inputContainer}>
  <Text style={designStyles.inputLabel}>New Password (optional)</Text>
  <TextInput
    style={designStyles.textInput}
    value={profileData.password}
    onChangeText={(text) => handleInputChange("password", text)}
    placeholder="Leave blank to keep current"
    secureTextEntry={!isEditing}  // Make the password visible when editing
  />
</View>

{profileData.password ? (
  <View style={designStyles.inputContainer}>
    <Text style={designStyles.inputLabel}>Confirm Password</Text>
    <TextInput
      style={designStyles.textInput}
      value={profileData.confirmPassword}
      onChangeText={(text) => handleInputChange("confirmPassword", text)}
      placeholder="Confirm new password"
      secureTextEntry={!isEditing}  // Make the confirm password visible when editing
    />
  </View>
) : null}


          <TouchableOpacity
            style={designStyles.actionButton}
            onPress={handleProfileUpdate}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={designStyles.buttonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
