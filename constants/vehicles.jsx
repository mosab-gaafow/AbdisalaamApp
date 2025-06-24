// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import DropDownPicker from 'react-native-dropdown-picker';
// import COLORS from '../../constants/color';
// import styles from '../styles/create.styles';
// import { API_URL } from '../../constants/api';
// import { useAuthStore } from '../../store/authStore';

// export default function Vehicles() {
//   const { token } = useAuthStore();
//   const [loading, setLoading] = useState(false);

//   const [plateNumber, setPlateNumber] = useState('');
//   const [model, setModel] = useState('');
//   const [capacity, setCapacity] = useState('');
//   const [type, setType] = useState(null);
//   const [userId, setUserId] = useState(null);

//   const [users, setUsers] = useState([]);
//   const [typeOpen, setTypeOpen] = useState(false);
//   const [userOpen, setUserOpen] = useState(false);

//   const vehicleTypes = [
//     { label: 'Car', value: 'Car' },
//     { label: 'Land Cruiser', value: 'Land_Cruiser' },
//     { label: 'BL', value: 'BL' },
//     { label: 'Bus', value: 'Bus' },
//     { label: 'Truck', value: 'Truck' },
//     { label: 'Coaster', value: 'Coaster' },
//   ];

//   const fetchUsers = async () => {
//     try {
//       const res = await fetch(`${API_URL}/auth/getAllVhecileOnwers`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       const options = data.map((u) => ({
//         label: `${u.name} (${u.phone})`,
//         value: u.id,
//       }));
//       setUsers(options);
//     } catch (e) {
//       console.error('Error fetching users', e.message);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const handleSubmit = async () => {
//     if (!plateNumber || !model || !capacity || !type || !userId) {
//       Alert.alert('Error', 'Please fill in all required fields.');
//       return;
//     }

//     try {
//       setLoading(true);

//       const res = await fetch(`${API_URL}/vehicles/registerVehicles`, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           plateNumber,
//           model,
//           capacity,
//           type,
//           userId,
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || 'Failed to register');

//       Alert.alert('Success', 'Vehicle registered successfully');
//       setPlateNumber('');
//       setModel('');
//       setCapacity('');
//       setType(null);
//       setUserId(null);
//     } catch (err) {
//       Alert.alert('Error', err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       style={{ flex: 1, backgroundColor: COLORS.background, padding: 20 }}
//     >
//       <View
//         style={{
//           backgroundColor: '#e1f1fb',
//           padding: 20,
//           borderRadius: 20,
//           shadowColor: '#000',
//           shadowOpacity: 0.05,
//           shadowRadius: 5,
//         }}
//       >
//         <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 }}>
//           Register New Vehicle
//         </Text>
//         <Text style={{ color: COLORS.textSecondary, marginBottom: 20 }}>
//           Admins can add new vehicles
//         </Text>

//         {/* Owner Dropdown */}
//         <View style={styles.formGroup}>
//           <Text style={styles.label}>Owner *</Text>
//           <DropDownPicker
//             open={userOpen}
//             value={userId}
//             items={users}
//             setOpen={setUserOpen}
//             setValue={setUserId}
//             placeholder="Select owner"
//             style={styles.dropdown}
//             dropDownContainerStyle={{ borderColor: COLORS.border }}
//             zIndex={3000}
//             zIndexInverse={1000}
//           />
//         </View>

//         {/* Plate Number */}
//         <View style={styles.formGroup}>
//           <Text style={styles.label}>Plate Number *</Text>
//           <View style={styles.inputContainer}>
//             <Ionicons name="pricetag-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               placeholder="AH 1090"
//               value={plateNumber}
//               onChangeText={setPlateNumber}
//               placeholderTextColor={COLORS.placeholderText}
//             />
//           </View>
//         </View>

//         {/* Model */}
//         <View style={styles.formGroup}>
//           <Text style={styles.label}>Model *</Text>
//           <View style={styles.inputContainer}>
//             <Ionicons name="car-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               placeholder="Land Cruiser 2020 V"
//               value={model}
//               onChangeText={setModel}
//               placeholderTextColor={COLORS.placeholderText}
//             />
//           </View>
//         </View>

//         {/* Capacity */}
//         <View style={styles.formGroup}>
//           <Text style={styles.label}>Capacity *</Text>
//           <View style={styles.inputContainer}>
//             <Ionicons name="people-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
//             <TextInput
//               style={styles.input}
//               placeholder="12"
//               value={capacity}
//               onChangeText={setCapacity}
//               keyboardType="numeric"
//               placeholderTextColor={COLORS.placeholderText}
//             />
//           </View>
//         </View>

//         {/* Type Dropdown */}
//         <View style={styles.formGroup}>
//           <Text style={styles.label}>Type *</Text>
//           <DropDownPicker
//             open={typeOpen}
//             value={type}
//             items={vehicleTypes}
//             setOpen={setTypeOpen}
//             setValue={setType}
//             placeholder="Select type"
//             style={styles.dropdown}
//             dropDownContainerStyle={{ borderColor: COLORS.border }}
//             zIndex={2000}
//             zIndexInverse={2000}
//           />
//         </View>

//         {/* Submit Button */}
//         <TouchableOpacity
//           onPress={handleSubmit}
//           style={{
//             backgroundColor: COLORS.primary,
//             paddingVertical: 14,
//             borderRadius: 12,
//             marginTop: 20,
//             alignItems: 'center',
//             flexDirection: 'row',
//             justifyContent: 'center',
//           }}
//         >
//           {loading ? (
//             <ActivityIndicator color="#fff" />
//           ) : (
//             <>
//               <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
//               <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Register</Text>
//             </>
//           )}
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }
