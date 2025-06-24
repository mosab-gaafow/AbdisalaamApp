import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import COLORS from "../../constants/color";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/home.styles";
import { API_URL } from "../../constants/api";
import { Picker } from "@react-native-picker/picker";
import RefreshButton from "../components/RefreshButton";

export default function UsersScreen() {
  const { token } = useAuthStore();
  const [users, setUsers] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({});

  // const fetchUsers = async () => {
  //   try {
  //     const response = await fetch(`${API_URL}/auth/getAllUsers`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     const data = await response.json();
  //     if (!response.ok) throw new Error(data.message || "Failed to fetch users");
  //     setUsers(data);
  //   } catch (err) {
  //     console.error("User fetch error:", err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const [loadingUsers, setLoadingUsers] = useState(true);

const fetchUsers = async () => {
  try {
    setLoadingUsers(true);
    const response = await fetch(`${API_URL}/auth/getAllUsers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to fetch users");
    setUsers(data);
  } catch (err) {
    console.error("User fetch error:", err.message);
  } finally {
    setLoadingUsers(false);
  }
};

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleShowUser = (user) => {
    setSelectedUser(user);
    setUpdatedUser({ ...user });
    setEditMode(false);
    setModalVisible(true);
  };

  const handleUpdateUser = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/updateUser/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update user");

      Alert.alert("✅ Success", "User updated successfully");
      setModalVisible(false);
      fetchUsers(); // Refresh
    } catch (err) {
      Alert.alert("❌ Error", err.message);
    }
  };

  
  const renderUserItem = ({ item, index }) => (
  <View style={tableRowStyle}>
    <Text style={[cellStyle, { flex: 1 }]}>{index + 1}</Text>
    <Text style={[cellStyle, { flex: 3 }]}>{item.name}</Text>
    <Text style={[cellStyle, { flex: 3 }]}>{item.email}</Text>
    <Text
      style={[
        cellStyle,
        { flex: 2, color: COLORS.primary, textTransform: "capitalize" },
      ]}
    >
      {item.role}
    </Text>
    <TouchableOpacity
      onPress={() => handleShowUser(item)}
      style={{ flex: 0.5, alignItems: "center" }}
    >
      <Ionicons name="ellipsis-vertical" size={20} color={COLORS.textPrimary} />
    </TouchableOpacity>
  </View>
);


  const renderUserModal = () => (
    
    <Modal visible={modalVisible} animationType="slide" transparent>
      <View style={modalBackdrop}>
        <View style={modalContent}>
          <Text style={modalTitle}>
            👤 {editMode ? "Edit User" : "User Details"}
          </Text>

          <View style={modalItem}>
            <Text style={modalLabel}>Name</Text>
            <TextInput
              value={updatedUser.name}
              onChangeText={(text) =>
                setUpdatedUser((prev) => ({ ...prev, name: text }))
              }
              editable={editMode}
              style={[inputStyle, !editMode && { backgroundColor: "transparent" }]}
            />
          </View>

          <View style={modalItem}>
            <Text style={modalLabel}>Email</Text>
            <TextInput
              value={updatedUser.email}
              onChangeText={(text) =>
                setUpdatedUser((prev) => ({ ...prev, email: text }))
              }
              editable={editMode}
              style={[inputStyle, !editMode && { backgroundColor: "transparent" }]}
            />
          </View>

          <View style={modalItem}>
            <Text style={modalLabel}>Role</Text>
            {editMode ? (
              <View style={pickerWrapper}>
                <Picker
                  selectedValue={updatedUser.role}
                  onValueChange={(value) =>
                    setUpdatedUser((prev) => ({ ...prev, role: value }))
                  }
                >
                  <Picker.Item label="Admin" value="admin" />
                  <Picker.Item label="Traveler" value="traveler" />
                  <Picker.Item label="Vehicle Owner" value="vehicle_owner" />
                </Picker>
              </View>
            ) : (
              <Text style={modalValue}>{updatedUser.role}</Text>
            )}
          </View>

          {editMode ? (
            <TouchableOpacity onPress={handleUpdateUser} style={modalCloseBtn}>
              <Text style={modalCloseText}>Save</Text>
            </TouchableOpacity>
          ) : (
            // <TouchableOpacity
            //   onPress={() => setEditMode(true)}
            //   style={[modalCloseBtn, { backgroundColor: COLORS.secondary }]}
            // >
            //   <Text style={modalCloseText}>Edit</Text>
            // </TouchableOpacity>
           <TouchableOpacity
  onPress={() => setEditMode(true)}
  style={modalEditBtn}
>
  <Text style={modalEditText}>Edit</Text>
</TouchableOpacity>


          )}

          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            style={[modalCloseBtn, { marginTop: 10 }]}
          >
            <Text style={modalCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loadingUsers) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}


  return (
    <View style={[styles.container, { paddingBottom: 100, backgroundColor: COLORS.background }]}>
      <Text style={[styles.bookTitle, { fontSize: 22, marginBottom: 16 }]}>👥 All Users</Text>

       <RefreshButton onRefresh={fetchUsers} loading={loadingUsers} />

      <View style={tableHeaderStyle}>
        <Text style={[cellStyle, { flex: 1, fontWeight: "700" }]}>#</Text>
        <Text style={[cellStyle, { flex: 3, fontWeight: "700" }]}>Name</Text>
        <Text style={[cellStyle, { flex: 3, fontWeight: "700" }]}>Email</Text>
        <Text style={[cellStyle, { flex: 2, fontWeight: "700" }]}>Role</Text>
        <Text style={[cellStyle, { flex: 0.5 }]}></Text>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
      />

      {renderUserModal()}
    </View>
  );
}

// Styles
const tableHeaderStyle = {
  flexDirection: "row",
  backgroundColor: COLORS.cardBackground,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  borderBottomWidth: 1,
  borderColor: COLORS.border,
  padding: 12,
};

const tableRowStyle = {
  flexDirection: "row",
  backgroundColor: COLORS.background,
  borderBottomWidth: 1,
  borderColor: COLORS.border,
  padding: 12,
  alignItems: "center",
};

const cellStyle = {
  fontSize: 14,
  color: COLORS.textPrimary,
};
// const modalEditBtn = {
//   backgroundColor: COLORS.secondary,  // or use COLORS.primary for the same blue as "Close"
//   paddingVertical: 10,
//   borderRadius: 10,
//   marginTop: 10,
//   marginBottom: 10,
//   elevation: 2,
// };

const modalEditBtn = {
  backgroundColor: COLORS.primary,  // Same as the "Close" button
  paddingVertical: 12,
  borderRadius: 10,
  marginTop: 10,
};


const modalEditText = {
  color: "#fff",
  fontSize: 16,
  textAlign: "center",
  fontWeight: "600",
};

const modalBackdrop = {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.4)",
  justifyContent: "center",
  alignItems: "center",
};

const modalContent = {
  backgroundColor: COLORS.cardBackground,
  width: "85%",
  borderRadius: 16,
  padding: 20,
  elevation: 6,
};

const modalTitle = {
  fontSize: 20,
  fontWeight: "700",
  marginBottom: 20,
  color: COLORS.textPrimary,
  textAlign: "center",
};

const modalItem = {
  marginBottom: 16,
};

const modalLabel = {
  fontSize: 13,
  color: COLORS.textSecondary,
  marginBottom: 4,
};

const modalValue = {
  fontSize: 16,
  color: COLORS.textPrimary,
  fontWeight: "600",
};

const inputStyle = {
  fontSize: 16,
  borderWidth: 1,
  borderColor: COLORS.border,
  borderRadius: 8,
  paddingVertical: 8,
  paddingHorizontal: 10,
  color: COLORS.textPrimary,
  backgroundColor: "#fff",
};

const modalCloseBtn = {
  backgroundColor: COLORS.primary,
  paddingVertical: 12,
  borderRadius: 10,
  marginTop: 10,
};

const modalCloseText = {
  color: "#fff",
  fontSize: 16,
  textAlign: "center",
  fontWeight: "600",
};


const pickerWrapper = {
  borderWidth: 1,
  borderColor: COLORS.border,
  borderRadius: 8,
  backgroundColor: "#fff",
};
