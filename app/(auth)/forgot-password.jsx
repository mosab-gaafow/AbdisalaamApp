import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { API_URL } from '../../constants/api';
import COLORS from '../../constants/color';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
  if (!email) return Alert.alert("Error", "Please enter your email");

  setLoading(true); // show "Sending..."

  try {
     const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to send reset code");
    }

    Alert.alert("✅ Code Sent", "A reset code was sent to your email.");
    
    // Navigate to verify code screen
    router.push({
      pathname: "/(auth)/verify-code",
      params: { email },
    });

  } catch (error) {
    console.log("❌ Error sending code:", error.message);
    Alert.alert("Error", error.message);
  } finally {
    setLoading(false); // hides "Sending..."
  }
};


  return (
    <View style={{ flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: COLORS.primary }}>
        📧 Forgot Password
      </Text>

      <TextInput
        placeholder="Enter your registered email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: COLORS.primary }]}
        onPress={handleSendCode}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Verification Code'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
};
