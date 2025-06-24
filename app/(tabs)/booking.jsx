import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import styles from "../styles/create.styles";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { API_URL } from "../../constants/api";
import COLORS from "../../constants/color";
import DropDownPicker from "react-native-dropdown-picker";
import { useRouter } from "expo-router";
import { Linking } from 'react-native';

export default function BookingForm() {
  const { token } = useAuthStore();
  const router = useRouter();

  const [trips, setTrips] = useState([]);
  const [tripId, setTripId] = useState(null);
  const [seatsBooked, setSeatsBooked] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [tripOptions, setTripOptions] = useState([]);

  // Fetch available trips
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        
        const res = await fetch(`${API_URL}/trips/public`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const formattedTrips = data.trips ? data.trips : data; // handle case if backend doesn't return with `trips: []`
        setTrips(formattedTrips);
        setTripOptions(
          formattedTrips.map((trip) => ({
            label: `${trip.origin} → ${trip.destination}`,
            value: trip.id,
          }))
        );
      } catch (err) {
        console.error("Error fetching trips:", err.message);
      }
    };

    fetchTrips();
  }, []);

  // const handleSubmit = async () => {
  //   if (!tripId || !seatsBooked) {
  //     Alert.alert(
  //       "Missing Fields",
  //       "Please select a trip and enter number of seats."
  //     );
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     const res = await fetch(`${API_URL}/bookings/registerBooking`, {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         tripId,
  //         seatsBooked: parseInt(seatsBooked),
  //       }),
  //     });

  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data.error || "Booking failed");

  //     Alert.alert("Success", "Your booking was submitted successfully!");
  //     setTripId(null);
  //     setSeatsBooked("");
  //     // router.push('/');
  //     Alert.alert("Success", "Booking created! Redirecting to payment...");
  //     router.push({
  //       pathname: "/evcPayment",
  //       params: {
  //         bookingId: data.id, // 👈 ID returned from booking
  //         amount: trips.find((t) => t.id === tripId)?.price || 0,
  //       },
  //     });
  //   } catch (err) {
  //     Alert.alert("Error", err.message || "Something went wrong");
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const handleSubmit = async () => {
    if (!tripId || !seatsBooked) {
      Alert.alert("Missing Fields", "Please select a trip and enter number of seats.");
      return;
    }
  
    try {
      setLoading(true);
  
      // Step 1: Register Booking
      const res = await fetch(`${API_URL}/bookings/registerBooking`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tripId,
          seatsBooked: parseInt(seatsBooked),
        }),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Booking failed");
  
      const selectedTrip = trips.find((t) => t.id === tripId);
      const amount = selectedTrip?.price || 0;
      const ownerPhone = selectedTrip?.user?.phone;
  
      if (!ownerPhone) {
        Alert.alert("Missing Info", "Trip owner phone not found.");
        return;
      }
  
      // Step 2: Launch native EVC Plus USSD
      const ussdCode = `tel:*712*${ownerPhone}*${amount}%23`; // `%23` is #
      Alert.alert("Payment", "Opening your dialer to pay via EVC Plus...");
  
      setTimeout(() => {
        Linking.openURL(ussdCode);
      }, 1000);
  
      setTripId(null);
      setSeatsBooked('');
    } catch (err) {
      Alert.alert("Error", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* <ScrollView contentContainerStyle={styles.container} style={styles.scrollViewStyle}> */}
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Book a Trip</Text>
            <Text style={styles.subtitle}>
              Select a trip and number of seats
            </Text>
          </View>

          <View style={styles.form}>
            {/* Trip Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Select Trip</Text>
              <DropDownPicker
                open={open}
                setOpen={setOpen}
                items={tripOptions}
                value={tripId}
                setValue={setTripId}
                placeholder="Choose a route"
                style={{ marginTop: 8 }}
                zIndex={1000}
              />
            </View>

            {/* Seats */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Seats to Book</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="people-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 2"
                  value={seatsBooked}
                  onChangeText={setSeatsBooked}
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.placeholderText}
                />
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-done-outline"
                    size={20}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Confirm Booking</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
