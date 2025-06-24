import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Button,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";
import { useAuthStore } from "../../store/authStore";
import { API_URL } from "../../constants/api";
import COLORS from "../../constants/color";
import styles from "../styles/create.styles";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function Trip() {
  const router = useRouter();
  const { token } = useAuthStore();

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("");
  const [totalSeats, setTotalSeats] = useState("");
  const [loading, setLoading] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [typeOpen, setTypeOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [vehciles, setVehciles] = useState([]);
  const [userOpen, setUserOpen] = useState(false);
  const [type, setType] = useState(null);
  const [vehicleList, setVehicleList] = useState([]); // store full objects too

  const [modalVisible, setModalVisible] = useState(false);
  const [trips, setTrips] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editTripId, setEditTripId] = useState(null);

  const tripStatus = [
    { label: "Pending", value: "PENDING" },
    { label: "OnGoing", value: "ONGOING" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  const fetchTrips = async () => {
    try {
      const res = await fetch(`${API_URL}/trips/getAllTrips`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok && data.trips) {
        setTrips(data.trips);
      }
    } catch (e) {
      console.error("Error fetching trips:", e.message);
    }
  };

  useEffect(() => {
    fetchVehciles();
    fetchTrips(); // fetch trips initially
  }, []);

  const fetchVehciles = async () => {
    try {
      const res = await fetch(`${API_URL}/vehicles/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      setVehicleList(data); // keep full list

      const options = data.map((car) => ({
        label: `${car.model} (${car.type})`,
        value: car.id,
      }));
      setVehciles(options);
    } catch (e) {
      console.error("Failed to fetch vehciles:", e.message);
    }
  };

  // const handleSubmit = async () => {
  //   if (
  //     !origin ||
  //     !destination ||
  //     !date ||
  //     !time ||
  //     !price ||
  //     !totalSeats ||
  //     !userId
  //   ) {
  //     Alert.alert("Error", "Please fill in all fields.");
  //     return;
  //   }

  //   try {
  //     setLoading(true);

  //     const payload = {
  //       origin,
  //       destination,
  //       date,
  //       time,
  //       price,
  //       totalSeats,
  //       status: type || "PENDING",
  //       vehicleIds: [userId],
  //     };

  //     const endpoint = isEditing
  //       ? `${API_URL}/trips/${editTripId}`
  //       : `${API_URL}/trips/registerTrip`;

  //     const method = isEditing ? "PUT" : "POST";

  //     const res = await fetch(endpoint, {
  //       method,
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     const data = await res.json();
  //     if (!res.ok) {
  //       console.error("Error response from server:", data); 
  //       throw new Error(data.message || "Something went wrong");
        
  //     }

  //     Alert.alert(
  //       "Success",
  //       `Trip ${isEditing ? "updated" : "created"} successfully`
  //     );
  //     resetForm();
  //     setModalVisible(false);

  //     fetchTrips();
  //   } catch (err) {
  //     Alert.alert("Error", err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const handleSubmit = async () => {
  if (
    !origin ||
    !destination ||
    !date ||
    !time ||
    !price ||
    !totalSeats ||
    !userId
  ) {
    Alert.alert("Error", "Please fill in all fields.");
    return;
  }

  try {
    setLoading(true);

    // Ensure the date is in a valid ISO format (ISO 8601 DateTime)
    let formattedDate = new Date(date);
    if (isNaN(formattedDate.getTime())) {
      throw new Error("Invalid date format");
    }

    // Convert date to ISO string with time
    formattedDate = formattedDate.toISOString();

    // Ensure price is a float
    let formattedPrice = parseFloat(price);
    if (isNaN(formattedPrice)) {
      throw new Error("Invalid price format");
    }

    // Ensure totalSeats is an integer
    let formattedTotalSeats = parseInt(totalSeats, 10);
    if (isNaN(formattedTotalSeats)) {
      throw new Error("Invalid totalSeats format");
    }

    const payload = {
      origin,
      destination,
      date: formattedDate, // Correct format for Prisma
      time,
      price: formattedPrice, // Correcting price to float
      totalSeats: formattedTotalSeats, // Correcting totalSeats to integer
      status: type || "PENDING",
      vehicleIds: [userId],
    };

    const endpoint = isEditing
      ? `${API_URL}/trips/${editTripId}`
      : `${API_URL}/trips/registerTrip`;

    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Error response from server:", data);  // Log error response
      throw new Error(data.message || "Something went wrong");
    }

    Alert.alert(
      "Success",
      `Trip ${isEditing ? "updated" : "created"} successfully`
    );
    resetForm();
    setModalVisible(false);

    fetchTrips();
  } catch (err) {
    console.error("Error in handleSubmit:", err);  // Log the error
    Alert.alert("Error", err.message);
  } finally {
    setLoading(false);
  }
};


  const resetForm = () => {
    setOrigin("");
    setDestination("");
    setDate("");
    setTime("");
    setPrice("");
    setTotalSeats("");
    setUserId(null);
    setType(null);
    setIsEditing(false);
    setEditTripId(null);
  };

  const handleDeleteTrip = async (id) => {
    console.log("Deleting trip with ID:", id); // Add this
    Alert.alert("Confirm", "Are you sure you want to delete this trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(`${API_URL}/trips/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to delete");

            fetchTrips();
          } catch (err) {
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    if (modalVisible && isEditing) {
      // Ensure dropdown initializes after modal opens
      setTimeout(() => {
        setUserOpen(true);
        setTimeout(() => setUserOpen(false), 100); // Open then close to force dropdown init
      }, 100);
    }
  }, [modalVisible]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Create Trip Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{
          backgroundColor: COLORS.primary,
          padding: 12,
          margin: 20,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>+ Create Trip</Text>
      </TouchableOpacity>

      {/* Create Trip Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        transparent={true}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.1)",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <ScrollView
            contentContainerStyle={{
              backgroundColor: "#fff",
              padding: 18,
              borderRadius: 14,
              minHeight: 400,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              <View style={styles.header}>
                {/* <Text style={styles.title}>Add New Trip</Text> */}
                <Text style={styles.title}>
                  {isEditing ? "Edit Trip" : "Add New Trip"}
                </Text>

                <Text style={styles.subtitle}>
                  Enter details for your upcoming journey
                </Text>
              </View>

              <View style={styles.form}>
                {/* VEHICLE DROPDOWN */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Vehicle *</Text>
                  <DropDownPicker
                    open={userOpen}
                    value={userId}
                    items={vehciles}
                    setOpen={setUserOpen}
                    setValue={setUserId}
                    onChangeValue={(val) => {
                      const selectedVehicle = vehicleList.find(
                        (v) => v.id === val
                      );
                      if (selectedVehicle) {
                        setTotalSeats(selectedVehicle.capacity.toString());
                      }
                    }}
                    placeholder="Select Vehicle"
                    style={[styles.dropdown, { borderColor: COLORS.border }]}
                    dropDownContainerStyle={{
                      borderColor: COLORS.border,
                      maxHeight: 150,
                    }}
                    zIndex={3000}
                    zIndexInverse={1000}
                    listMode="SCROLLVIEW"
                  />
                </View>

                {/* ORIGIN */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Origin *</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="navigate-outline"
                      size={20}
                      color={COLORS.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Mogadishu"
                      placeholderTextColor={COLORS.placeholderText}
                      value={origin}
                      onChangeText={setOrigin}
                    />
                  </View>
                </View>

                {/* DESTINATION */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Destination *</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="flag-outline"
                      size={20}
                      color={COLORS.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Baidoa"
                      placeholderTextColor={COLORS.placeholderText}
                      value={destination}
                      onChangeText={setDestination}
                    />
                  </View>
                </View>

                {/* DATE */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Date *</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={styles.inputContainer}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color={COLORS.primary}
                      style={styles.inputIcon}
                    />
                    <Text style={styles.input}>
                      {date || "Tap to select date"}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={date ? new Date(date) : new Date()}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        if (selectedDate) {
                          setDate(selectedDate.toISOString().split("T")[0]);
                        }
                      }}
                    />
                  )}
                </View>

                {/* TIME */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Time *</Text>
                  <TouchableOpacity
                    onPress={() => setShowTimePicker(true)}
                    style={styles.inputContainer}
                  >
                    <Ionicons
                      name="time-outline"
                      size={20}
                      color={COLORS.primary}
                      style={styles.inputIcon}
                    />
                    <Text style={styles.input}>
                      {time || "Tap to select time"}
                    </Text>
                  </TouchableOpacity>
                  {showTimePicker && (
                    <DateTimePicker
                      value={new Date()}
                      mode="time"
                      display="default"
                      onChange={(event, selectedTime) => {
                        setShowTimePicker(false);
                        if (selectedTime) {
                          const hours = selectedTime
                            .getHours()
                            .toString()
                            .padStart(2, "0");
                          const minutes = selectedTime
                            .getMinutes()
                            .toString()
                            .padStart(2, "0");
                          setTime(`${hours}:${minutes}`);
                        }
                      }}
                    />
                  )}
                </View>

                {/* PRICE */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Price (USD) *</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="cash-outline"
                      size={20}
                      color={COLORS.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="10"
                      keyboardType="numeric"
                      placeholderTextColor={COLORS.placeholderText}
                      value={price}
                      onChangeText={setPrice}
                    />
                  </View>
                </View>

                {/* TOTAL SEATS */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Total Seats *</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="people-outline"
                      size={20}
                      color={COLORS.primary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="15"
                      keyboardType="numeric"
                      placeholderTextColor={COLORS.placeholderText}
                      value={totalSeats}
                      onChangeText={setTotalSeats}
                      editable={false}
                    />
                  </View>
                </View>

                {/* STATUS DROPDOWN */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Trip Status *</Text>
                  <DropDownPicker
                    open={typeOpen}
                    value={type}
                    items={tripStatus}
                    setOpen={setTypeOpen}
                    setValue={setType}
                    placeholder="Select Trip status"
                    style={[styles.dropdown, { borderColor: COLORS.border }]}
                    dropDownContainerStyle={{
                      borderColor: COLORS.border,
                      maxHeight: 150,
                    }}
                    zIndex={2000}
                    zIndexInverse={2000}
                    listMode="SCROLLVIEW"
                  />
                </View>

                {/* SUBMIT BUTTON */}
                <TouchableOpacity
                  style={styles.button}
                  // onPress= {}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons
                        name="cloud-upload-outline"
                        size={20}
                        color="#fff"
                        style={styles.buttonIcon}
                      />
                      {/* <Text style={styles.buttonText}>Create Trip</Text> */}
                      <Text style={styles.buttonText}>
                        {isEditing ? "Update Trip" : "Create Trip"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* CANCEL BUTTON */}
                {/* <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 16, alignItems: "center" }}> */}
                <TouchableOpacity
                  onPress={() => {
                    resetForm();
                    setModalVisible(false);
                  }}
                  style={{ marginTop: 16, alignItems: "center" }}
                >
                  <Text style={{ color: COLORS.primary, fontWeight: "bold" }}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* TRIP LIST */}
      <View style={{ padding: 20 }}>
        <Text
          style={{
            fontWeight: "600",
            fontSize: 18,
            marginBottom: 10,
            color: COLORS.textDark,
          }}
        >
          🚐 Your Trips
        </Text>

        {trips.map((trip) => (
          <View
            key={trip.id}
            style={{
              backgroundColor: COLORS.cardBackground,
              borderRadius: 10,
              padding: 12,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: COLORS.border,
              position: "relative",
            }}
          >
            {/* Top Right Icons */}
            <View
  style={{
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    gap: 10,
  }}
>
  <View style={{ flex: 1 }}>
    <Button
      title="Edit"
      color={COLORS.primary}
      onPress={() => {
        setIsEditing(true);
        setEditTripId(trip.id);
        setOrigin(trip.origin);
        setDestination(trip.destination);
        setDate(trip.date?.split("T")[0] || "");
        setTime(trip.time || "");
        setPrice(trip.price?.toString() || "");
        setTotalSeats(trip.totalSeats?.toString() || "");
        setType(trip.status || "PENDING");
        setUserId(trip.vehicleIds?.[0] || null);

        setTimeout(() => {
          setModalVisible(true);
          setUserOpen(true);
          setTimeout(() => setUserOpen(false), 100);
        }, 50);
      }}
    />
  </View>

  <View style={{ flex: 1 }}>
    <Button
      title="Delete"
      color="red"
      onPress={() => {
        Alert.alert(
          "Confirm Delete",
          "Are you sure you want to delete this trip?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () => handleDeleteTrip(trip.id),
            },
          ]
        );
      }}
    />
  </View>
</View>


            <Text style={{ fontWeight: "600", color: COLORS.textPrimary }}>
              {trip.origin} → {trip.destination}
            </Text>
            <Text style={{ color: COLORS.textSecondary }}>
              Date: {new Date(trip.date).toLocaleDateString()} • Time:{" "}
              {trip.time}
            </Text>
            <Text style={{ color: COLORS.textSecondary }}>
              Price: ${trip.price} • Seats: {trip.availableSeats}/
              {trip.totalSeats}
            </Text>
            <Text style={{ color: COLORS.primary }}>Status: {trip.status}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
