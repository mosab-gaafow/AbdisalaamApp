import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import COLORS from '../../constants/color';
import styles from '../styles/create.styles';
import { API_URL } from '../../constants/api';
import { useAuthStore } from '../../store/authStore';

export default function Vehicles() {
  const [modalVisible, setModalVisible] = useState(false);
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const [plateNumber, setPlateNumber] = useState('');
  const [model, setModel] = useState('');
  const [capacity, setCapacity] = useState('');
  const [type, setType] = useState(null);
  const [userId, setUserId] = useState(null);

  const [users, setUsers] = useState([]);
  const [typeOpen, setTypeOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [vehicleList, setVehicleList] = useState([]);
  const [editingVehicle, setEditingVehicle] = useState(null);


  const vehicleTypes = [
    { label: 'Car', value: 'Car' },
    { label: 'Land Cruiser', value: 'Land_Cruiser' },
    { label: 'BL', value: 'BL' },
    { label: 'Bus', value: 'Bus' },
    { label: 'Truck', value: 'Truck' },
    { label: 'Coaster', value: 'Coaster' },
  ];

  const fetchUsers = async () => {
  try {
    const res = await fetch(`${API_URL}/auth/getAllVhecileOnwers`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch owners");

    const data = await res.json();
    const options = data.map((u) => ({
      label: `${u.name} (${u.phone})`,
      value: u.id,
    }));
    setUsers(options);
  } catch (e) {
    console.error('Error fetching users', e.message);
  }
};


  useEffect(() => {
    fetchUsers();
  }, []);

    const handleSubmit = async () => {
  if (!plateNumber || !model || !capacity || !type || !userId) {
    Alert.alert('Error', 'Please fill in all required fields.');
    return;
  }

  try {
    setLoading(true);

    const method = editingVehicle ? 'PUT' : 'POST';
    const url = editingVehicle
      ? `${API_URL}/vehicles/${editingVehicle.id}`
      : `${API_URL}/vehicles/registerVehicles`;

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plateNumber,
        model,
        capacity,
        type,
        userId,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');

    Alert.alert('Success', editingVehicle ? 'Vehicle updated' : 'Vehicle registered');
    // reset form
    setPlateNumber('');
    setModel('');
    setCapacity('');
    setType(null);
    setUserId(null);
    setEditingVehicle(null);
    setModalVisible(false);
    fetchRegisteredVehicles(); // re-fetch data
  } catch (err) {
    Alert.alert('Error', err.message);
  } finally {
    setLoading(false);
  }
};


  const handleEdit = (vehicle) => {
  setPlateNumber(vehicle.plateNumber);
  setModel(vehicle.model);
  setCapacity(String(vehicle.capacity));
  setType(vehicle.type);
  setUserId(vehicle.userId);
  setEditingVehicle(vehicle); // track which vehicle is being edited
  setModalVisible(true);
};


  const handleDeleteVehicle = async (id) => {
  Alert.alert('Confirm', 'Are you sure you want to delete this vehicle?', [
    {
      text: 'Cancel',
      style: 'cancel',
    },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: async () => {
        try {
          const res = await fetch(`${API_URL}/vehicles/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) throw new Error("Failed to delete");

          Alert.alert("Deleted", "Vehicle has been removed.");
          fetchRegisteredVehicles(); // Refresh list
        } catch (err) {
          Alert.alert("Error", err.message);
        }
      },
    },
  ]);
};



const fetchRegisteredVehicles = async () => {
  try {
    const res = await fetch(`${API_URL}/vehicles/getAllVehicles`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch vehicles");

    const data = await res.json();
    setVehicleList(data);
  } catch (e) {
    console.error("Error fetching vehicles", e.message);
  }
};

useEffect(() => {
  fetchRegisteredVehicles();
}, []);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background, padding: 20 }}>
      {/* ➕ Button to open modal */}
      <TouchableOpacity
        // onPress={() => setModalVisible(true)}
        onPress={() => {
  setPlateNumber('');
  setModel('');
  setCapacity('');
  setType(null);
  setUserId(null);
  setEditingVehicle(null); // clear editing state
  setModalVisible(true);
}}

        style={{
          alignSelf: 'flex-end',
          backgroundColor: COLORS.primary,
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 10,
          marginBottom: 14,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>➕ Add Vehicle</Text>
      </TouchableOpacity>

      {vehicleList.map((v, idx) => (
  <View key={v.id || idx} style={{
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  }}>
    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{v.plateNumber}</Text>
    <Text>Model: {v.model}</Text>
    <Text>Capacity: {v.capacity}</Text>
    <Text>Type: {v.type}</Text>
    <Text>Owner: {v.owner?.name || 'N/A'}</Text>

    <View style={{ flexDirection: 'row', marginTop: 10 }}>
    <TouchableOpacity
  onPress={() => handleEdit(v)}
  style={{
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 6,
    marginRight: 10,
  }}
>
  <Text style={{ color: "#fff" }}>Edit</Text>
</TouchableOpacity>


      <TouchableOpacity
        onPress={() => handleDeleteVehicle(v.id)}
        style={{
          backgroundColor: 'red',
          padding: 8,
          borderRadius: 6,
        }}
      >
        <Text style={{ color: "#fff" }}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
))}

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{
              backgroundColor: COLORS.background,
              borderRadius: 20,
              padding: 20,
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 }}>
              Register New Vehicle
            </Text>
            <Text style={{ color: COLORS.textSecondary, marginBottom: 20 }}>
              Admins can add new vehicles
            </Text>

            {/* Form Fields */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Owner *</Text>
              <DropDownPicker
                open={userOpen}
                value={userId}
                items={users}
                setOpen={setUserOpen}
                setValue={setUserId}
                placeholder="Select owner"
                style={styles.dropdown}
                dropDownContainerStyle={{ borderColor: COLORS.border }}
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Plate Number *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="pricetag-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="AH 1090"
                  value={plateNumber}
                  onChangeText={setPlateNumber}
                  placeholderTextColor={COLORS.placeholderText}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Model *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="car-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Land Cruiser 2020 V"
                  value={model}
                  onChangeText={setModel}
                  placeholderTextColor={COLORS.placeholderText}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Capacity *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="people-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="12"
                  value={capacity}
                  onChangeText={setCapacity}
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.placeholderText}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Type *</Text>
              <DropDownPicker
                open={typeOpen}
                value={type}
                items={vehicleTypes}
                setOpen={setTypeOpen}
                setValue={setType}
                placeholder="Select type"
                style={styles.dropdown}
                dropDownContainerStyle={{ borderColor: COLORS.border }}
                zIndex={2000}
                zIndexInverse={2000}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              style={{
                backgroundColor: COLORS.primary,
                paddingVertical: 14,
                borderRadius: 12,
                marginTop: 20,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                  {/* <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Register</Text> */}
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
  {editingVehicle ? 'Save Changes' : 'Register'}
</Text>

                </>
              )}
            </TouchableOpacity>

            {/* Close Modal Button */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{
                marginTop: 20,
                alignSelf: 'center',
                backgroundColor: COLORS.secondary,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 10,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Close</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}
