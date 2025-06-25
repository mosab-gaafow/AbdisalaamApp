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
  Switch,
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
import RefreshButton from "../components/RefreshButton";

export default function Trip() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [expandedTripId, setExpandedTripId] = useState(null);

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("");
  const [totalSeats, setTotalSeats] = useState("");
  const [loading, setLoading] = useState(false);
  const [tripTypeFilter, setTripTypeFilter] = useState("All"); // "All", "Travel", or "Tourism"

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
  const [refreshing, setRefreshing] = useState(false);


  const tripStatus = [
    { label: "Pending", value: "PENDING" },
    { label: "OnGoing", value: "ONGOING" },
    { label: "Completed", value: "COMPLETED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

 const fetchTrips = async (typeParam = "All") => {
  try {
    const queryParam = typeParam === "All" ? "" : `?tripType=${typeParam}`;
    const res = await fetch(`${API_URL}/trips/getAllTrips${queryParam}`, {
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

const handleRefresh = async () => {
  try {
    setRefreshing(true);
    await fetchTrips(tripTypeFilter); // respect current filter
  } finally {
    setRefreshing(false);
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
    const [tripType, setTripType] = useState("Travel");
const [tourismFeatures, setTourismFeatures] = useState({
  lunch: true,
  photographing: true,
  sunsetView: true,
  tourGuide: true,
  culturalVisit: true,
});



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
  date: formattedDate,
  time,
  price: formattedPrice,
  totalSeats: formattedTotalSeats,
  status: type || "PENDING",
  vehicleIds: [userId],
  isTourism: tripType === "Tourism",
  tourismFeatures: tripType === "Tourism" ? tourismFeatures : undefined,
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
    setTripType("Travel");

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
              <View style={styles.formGroup}>
  <Text style={styles.label}>Trip Type *</Text>
  <View style={{ flexDirection: "row", gap: 10 }}>
    {["Travel", "Tourism"].map((item) => (
      <TouchableOpacity
        key={item}
        onPress={() => setTripType(item)}
        style={{
          backgroundColor: tripType === item ? COLORS.primary : "#eee",
          padding: 10,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: tripType === item ? "#fff" : COLORS.textPrimary }}>
          {item}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
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

                {tripType === "Tourism" && (
  <View style={styles.formGroup}>
    <Text style={styles.label}>Included Tourism Features</Text>

    {[
      { key: "lunch", label: "Free Lunch" },
      { key: "photographing", label: "Photographing & Videography" },
      { key: "sunsetView", label: "Sunset/Sunrise Viewpoints" },
      { key: "tourGuide", label: "Local Tour Guide" },
      { key: "culturalVisit", label: "Cultural/Religious Site Visits" },
    ].map((item) => (
      <View
        key={item.key}
        style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 5 }}
      >
        <Text>{item.label}</Text>
        <Switch
          value={tourismFeatures[item.key]}
          onValueChange={(val) =>
            setTourismFeatures((prev) => ({ ...prev, [item.key]: val }))
          }
        />
      </View>
    ))}
  </View>
)}


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

                {/* <View style={{ alignItems: "flex-end", marginRight: 20 }}>
  <RefreshButton onPress={handleRefresh} loading={refreshing} />
</View> */}


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


                  
     <View style={{ marginBottom: 10, alignItems: "center" }}>
  <Text style={{ fontWeight: "600", marginBottom: 6 }}>Filter by Trip Type</Text>
  <View style={{ flexDirection: "row", gap: 10 }}>
    {["All", "Travel", "Tourism"].map((type) => (
      <TouchableOpacity
        key={type}
        onPress={() => {
          setTripTypeFilter(type);
          fetchTrips(type);
        }}
        style={{
          backgroundColor: tripTypeFilter === type ? COLORS.primary : "#ddd",
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 8,
          marginHorizontal: 4,
        }}
      >
        <Text style={{ color: tripTypeFilter === type ? "#fff" : "#000" }}>{type}</Text>
      </TouchableOpacity>
      
    ))}
    
  </View>
</View>


      <RefreshButton onPress={handleRefresh} loading={refreshing} />


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

        {trips.map((trip) => {
  const isExpanded = expandedTripId === trip.id;
  return (
    <TouchableOpacity
      key={trip.id}
      onPress={() => setExpandedTripId(isExpanded ? null : trip.id)}
      activeOpacity={0.9}
      style={{
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      }}
    >
      <View style={{ marginBottom: 6 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", color: COLORS.textPrimary }}>
          {trip.origin} → {trip.destination}
        </Text>
        <Text style={{ color: COLORS.textSecondary }}>
          {new Date(trip.date).toLocaleDateString()} at {trip.time}
        </Text>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
        <Text style={{ color: COLORS.textSecondary }}>
          💺 {trip.availableSeats}/{trip.totalSeats} Seats
        </Text>
        <Text style={{ color: COLORS.textSecondary }}>💰 ${trip.price}</Text>
      </View>

      <Text style={{ color: COLORS.primary, marginTop: 4 }}>🛣 {trip.status}</Text>

      {/* Expanded Details */}
      {isExpanded && (
        <View style={{ marginTop: 10 }}>
          <Text style={{ fontWeight: "600", marginBottom: 4 }}>🔍 Details</Text>

          {trip.isTourism ? (
            <View style={{ marginBottom: 6 }}>
              <Text style={{ fontWeight: "500", marginBottom: 4, color: COLORS.textDark }}>
                🏕 Tourism Package Includes:
              </Text>
              {trip.tourismFeatures?.lunch && <Text>🍱 Free Lunch</Text>}
              {trip.tourismFeatures?.photographing && <Text>📸 Photography & Videography</Text>}
              {trip.tourismFeatures?.sunsetView && <Text>🌅 Sunset/Sunrise Viewpoints</Text>}
              {trip.tourismFeatures?.tourGuide && <Text>🧭 Local Tour Guide</Text>}
              {trip.tourismFeatures?.culturalVisit && <Text>🕌 Cultural/Religious Visits</Text>}
            </View>
          ) : (
            <Text style={{ color: COLORS.textSecondary }}>This is a regular travel trip.</Text>
          )}

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
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
                setTripType(trip.isTourism ? "Tourism" : "Travel");
                setTourismFeatures(trip.tourismFeatures || {});
                setTimeout(() => {
                  setModalVisible(true);
                  setUserOpen(true);
                  setTimeout(() => setUserOpen(false), 100);
                }, 50);
              }}
            />
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
      )}
    </TouchableOpacity>
  );
})}

      </View>
    </View>
  );
}
